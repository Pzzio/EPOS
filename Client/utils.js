var $scope = {test: "Hey!"}
var bodyContent;
var elementsWithVars = [];
var elementCnt = 0;
var lockInput = false;

class VarContainer{
    constructor(element, name){
        this.element = element;
        this.name = name;
    }
}

/* Function to dynamically create HTML Lists.
 * The first argument is the list to be printed
 * The second is the action to be performed on every element before printing
 */
function buildList(input, action){
    for(element in input){
        document.write('<li>' + action(element) + '</li>');
    }
}

function doGet(){

}

function doPost(){

}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function replaceVarsInDOM(classToFocus){
    if(bodyContent == undefined){
        bodyContent = document.body.innerHTML;
    }
    var all = bodyContent;

    for (property in $scope) {
        if ($scope.hasOwnProperty(property)) {
            all = replaceAll(all, "{{"+property+"}}", $scope[property]);
        }
    }
    document.body.innerHTML = all;
    if(classToFocus !== undefined && document.getElementsByClassName(classToFocus)[0] !== undefined){
        document.getElementsByClassName(classToFocus)[0].onfocus = function(){this.value = this.value;};
        document.getElementsByClassName(classToFocus)[0].focus();
    }
}

function checkForVarsInDOM(){
    var allTags = document.body.getElementsByTagName('*');
    for(var i = 0; i < allTags.length; i++){
        if(new RegExp('{{[a-z|A-Z]*}}', 'g').test(''+allTags[i].value)){
            allTags[i].className += elementCnt;
            elementCnt++;
            var varName = (''+allTags[i].value).match(/{{[a-z|A-Z]*}}/)[0].replace('{{', '').replace('}}', '');
            elementsWithVars.push(new VarContainer(allTags[i], varName));
        }
    }

    document.onkeydown = function(e){
        if(e.keyCode === 17){
            lockInput = true;
        }
    }
    document.onkeyup = function(e){
        if(!lockInput){
            var target = (e.target) ? e.target : e.srcElement;

            for(var i = 0; i < elementsWithVars.length; i++){
                if(elementsWithVars[i].element.className === target.className){
                    $scope[elementsWithVars[i].name] = target.value;
                }
            }
            replaceVarsInDOM(target.className);
        }
        else{
            if(e.keyCode === 17){
                lockInput = false;
            }
        }
    };

    replaceVarsInDOM();
}

checkForVarsInDOM();


// NotVue's constructor
// Expects an object with all its settings, mainly el and data
function NotVue(params) {
    // TODO sanity check if el is present in params object
    this.el = params.el; 

		// during setting up getter/setter empty
		this.data = {};

		// register callbacks for every element in data
    for (dataElement in params.data) {
				// Enable one way binding for all data
        // Which {{variable}} is to be replaced
        var variable = dataElement;

        // What to replace the variable with
        var content = params.data[dataElement];

				// When data changes, update the DOM
				Object.defineProperty(this.data, dataElement, {
						get : function(){
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

		// Actually copy data, once getter/setter are set up
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
