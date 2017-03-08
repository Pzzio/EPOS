var $scope = {test: "Hey!"}
var bodyContent;
var elementsWithVars = [];
var elementCnt = 0;
var lockInput = false;

// NotVue's constructor
// Expects an object with all its settings, mainly el and data
function NotVue(params) {
    // TODO sanity check if el is present in params object

    this.el = params.el; 

    // during setting up getter/setter empty
    this.data = {};

    // register callbacks for every element in data
    for (dataElement in params.data) {
        // Which {{variable}} is to be replaced
        var variable = dataElement;

        // What to replace the variable with
        var content = params.data[dataElement];

        // When data changes, update the DOM
        Object.defineProperty(this.data, dataElement, {
            get :   function(){
                        return this._name;
                    },

            set: 	function(val){  
                        // TODO check if content is actually a string

                        replaceVarsInDOM(variable, content);

                        console.log("will change to: " + val);
                        this._name = val;
                            
                    }
        });
    }

    // Only copy data, once getter/setter are set up
    this.data = params.data;
}

// Create a test NotVue object
var notVue = new NotVue({
    el: '#test',
    data: {
        message:    'Hello NotView!',
        test:       'testContent',
        tom:        'hello'
    }
});

notVue.data.message = 'changged';
notVue.data.test = 'changged';

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
						notVue.data[varToBind] = inputElement.value; 
				};	
    }
}

// Assign oninput listeners
scanForInputTags();
