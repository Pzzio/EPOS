
/* Function to dynamically create HTML Lists.
 * The first argument is the list to be printed
 * The second is the action to be performed on every element before printing
 */
function buildList(input, action){
    console.log('Hello');
    for(element in input){
        console.log(element);
        document.write('<li>' + action(element) + '</li>');
    }
}

function doGet(){

}

function doPost(){

}