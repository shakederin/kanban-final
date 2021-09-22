const arrayOfUl = document.querySelectorAll("Ul");
const arrayOfInputs = document.querySelectorAll("input");
const arrayOfButton = document.querySelectorAll("button");

for ( let i = 0; i < 3 ; i++ ){
    whenClicked(arrayOfUl[i].id, arrayOfInputs[i+1].id, arrayOfButton[i].id )
}

//add onclick to button when clicked
function whenClicked (listId, innputId, submitId){ 
    const list = document.getElementById(listId)
    const input = document.getElementById(innputId)
    const button = document.getElementById(submitId);
    button.addEventListener("click", function(){createListElement(list, input)})
}
// create list element when Clicked
function createListElement(list, input){
    if ( input.value === ""){ return;} // make sure that the input aint empty
    let newLi = document.createElement("LI"); 
    newLi.classList.add("tasksDesign")
    let task = input.value;
    newLi.innerText = task;
    let deleteTask = document.createElement("span"); // create an element to delete task
    deleteTask.addEventListener("click", function(){deleteTask.closest("li").remove()})
    deleteTask.classList.add("removeTaskButton");
    deleteTask.innerText = "[X]";
    newLi.append(deleteTask);
    list.prepend(newLi);
    input.value = "";
}






