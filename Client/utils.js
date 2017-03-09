var vueInstance = {};           // global reference to vue object
var dynamicElements = [];       // holds all elements which contain {{variable}} innerHTML
var internalData = {};          // holds all data, accessed only via the data-getter

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// Replace {{variableName}} with content
function replaceVarsInDOM()
{
    // iterate over dynamicElements list
    for (var i=0; i < dynamicElements.length; i++) {
        var element = dynamicElements[i].element;
        var initialInnerHTML = dynamicElements[i].initialContent;
        var variableName = dynamicElements[i].variableName;

        // TODO dynamically get vue object reference
        var variableContent = vueInstance.data[variableName];  

        // prevent content to be set to undefined
        if (!variableContent) {
            variableContent = "";
        }

        if (initialInnerHTML.includes(variableName)){

            var changedInner = replaceAll(initialInnerHTML, "{{"+variableName+"}}", variableContent);
            element.innerHTML = changedInner;	
        }
    }
}

function registerAllDynamicElements() {

		var allElements = document.getElementsByTagName("*");	

		for (var i = 0; i<allElements.length; i++) {

				var element = allElements[i];

				// make sure only text is in innerHTML
				if (element.children.length == 0) {
						if (element.innerHTML.length > 0) {
                                if (element.innerHTML.match(/.*\{.*\}.*/)) {
                                        var dynamicElement = {}; 

                                        dynamicElement.element = element;
                                        dynamicElement.initialContent = element.innerHTML;

                                        var matches = element.innerHTML.match(/\{\{(.*?)\}\}/);

                                        if (matches) {
                                            var str = dynamicElement.variableName;
                                            str = matches[0];
                                            
                                            // TODO oh god, please regex this
                                            str = str.replace('{','');
                                            str = str.replace('{','');
                                            str = str.replace('}','');
                                            str = str.replace('}','');

                                            dynamicElement.variableName = str;
                                        }  

                                        dynamicElements.push(dynamicElement); 
                                }
                        }
                }
        }
}


// NotVue's constructor
// Expects an object with all its settings, mainly el and data
function NotVue(params) {

    vueInstance = this;

    // save all element references with dynamic content in them
    registerAllDynamicElements();

    // TODO sanity check if el is present in params object

    this.el = params.el; 

    // during setting up getter/setter empty
    this.internalData = params.data;

    Object.defineProperty(this, 'data', { 
        get: function() { 
            return this.internalData; 
        },
        set: function(newVal) { 
            this.internalData = newVal; 
        } 
    });

    // Assign oninput listeners
    scanForInputTags();
    
    replaceVarsInDOM();
}

// Create a test NotVue object
var notVue = new NotVue({
    el: '#test',
    data: {
        message:    'Hello NotView!',
        test:       'testContent',
        tom:        'toms content'
    }
});

notVue.data.test = "changed test";

function scanForInputTags () {
    // TODO only start searching from the vue el element

    // Get all elements with a nv-model attribute
    var allElements = document.querySelectorAll("input[nv-model]") 

    for (var i = 0; i < allElements.length; i++)
    {
        var inputElement = allElements[i];

        inputElement.oninput = function(inputEvent){ 
            var inputElement = inputEvent.currentTarget;
            var varToBind = inputElement.getAttribute("nv-model");

            // TODO get the "closest" vue instance, meaning the one
            // with the closest el value in the DOM
            vueInstance.data[varToBind] = inputElement.value; 

            replaceVarsInDOM();
        };	

        // If the input element contains something, assign it right away
        if (inputElement.value)
        {
            var varToBind = inputElement.getAttribute("nv-model");
            vueInstance.data[varToBind] = inputElement.value; 
        }
    }
}
