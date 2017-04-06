// NotVue library for the Pzz.io project
// A library to dynamically bind variables in the DOM to JS and vice versa
// Might behave similar to vue.js but is definitely not vue.js
// ...promise
//
// Features:
// - Replace strings in the DOM by their equally named JS variables
//   e.g.:
//   <h1>{{title}}</h1>
//
// - Input fields with an "nv-model" Attribute update their 
//   entered variable on change.
//   e.g.:
//   <input nv-model="message"></input>
//
// NOTES
// If variables are changed via JS, make sure to call replaceVarsInDOM() to
// update all changes in the DOM

// NotVue's globals
let vueInstance = {};               // global reference to vue object
const dynamicElements = [];         // holds all elements which contain
                                    // {{variable}} innerHTML
let internalData = {};              // holds all data, accessed only via the data-getter

// NotVue's constructor
// Expects an object with all its settings, mainly el and data
//
// Example:
// const notVue = new NotVue({
//     el: '#el',
//     data: {
//         message: 'This will replace the {{message}}'
//     }
// });
function NotVue(params) {
    // save a reference to the vue instance (currently only one possible)
    vueInstance = this;

    // save all element references with dynamic content in them
    registerAllDynamicElements();

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

    setupInputElements();

    replaceVarsInDOM();
}


// Save references to the elements of DOM which change
// during runtime (e.g. the ones containing {{variables}})
function registerAllDynamicElements() {
    const allElements = document.getElementsByTagName("*");

    for (let i = 0; i<allElements.length; i++) {
        const element = allElements[i];

        // make sure only text is in innerHTML
        if (element.children.length == 0) {
            if (element.innerHTML.length > 0) {
                if (element.innerHTML.match(/.*\{.*\}.*/)) {
                    const dynamicElement = {};

                    dynamicElement.element = element;
                    dynamicElement.initialContent = element.innerHTML;

                    const matches = element.innerHTML.match(/\{\{(.*?)\}\}/);

                    if (matches) {
                        let str = dynamicElement.variableName;
                        str = matches[0];

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


// Make all input elements dynamically update variables if they have an
// "nv-model" Attribute.
function setupInputElements() {
    // Get all elements with a nv-model attribute
    const allElements = document.querySelectorAll("input[nv-model]");

    for (let i = 0; i < allElements.length; i++)
    {
        const inputElement = allElements[i];

        inputElement.oninput = function(inputEvent){
            const inputElement = inputEvent.currentTarget;
            const varToBind = inputElement.getAttribute("nv-model");

            vueInstance.data[varToBind] = inputElement.value;

            replaceVarsInDOM();
        };

        // If the input element contains something, assign it right away
        if (inputElement.value)
        {
            const varToBind = inputElement.getAttribute("nv-model");
            vueInstance.data[varToBind] = inputElement.value;
        }
    }
}


// Replace all registered {{variableName}} with content
function replaceVarsInDOM() {
    // iterate over dynamicElements list
    for (let i=0; i < dynamicElements.length; i++) {
        const element = dynamicElements[i].element;
        const initialInnerHTML = dynamicElements[i].initialContent;
        const variableName = dynamicElements[i].variableName;

        let variableContent = vueInstance.data[variableName];

        // prevent content to be set to undefined
        if (!variableContent) {
            variableContent = "";
        }

        if (initialInnerHTML.includes(variableName)){
            element.innerHTML = replaceAll( initialInnerHTML,
                                            "{{" + variableName + "}}",
                                            variableContent);
        }
    }
}


// Finds {{variable}} formatting
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}


// Replace the {{variable}} with the provided replacement
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
