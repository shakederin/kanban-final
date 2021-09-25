// Inserting the initial state.
if (localStorage.getItem("tasks") == null) {                                      //local storage
    localStorage.setItem("tasks", JSON.stringify({                   
        "todo": [],
        "in-progress": [],
        "done": []
    }));
}
else{ 
    const localStoreTasks = JSON.parse(localStorage.getItem("tasks"));
    for (let [status, tasks] of Object.entries(localStoreTasks)) {
        for (let task of tasks){
            createListElement(mapStatusToUlElement(status), task);
        }
    }
}

// creating the view.
const sectionList = document.querySelectorAll("section");
for (let index = 0 ; index < sectionList.length ; index++){
    const section = sectionList[index];
    const taskList = section.getElementsByClassName("list")[0];
    const inputElement = section.getElementsByClassName("input")[0];
    const buttonElement = section.getElementsByClassName("buttontask")[0];
    buttonElement.addEventListener("click", function(){
        if(inputElement.value === "") {                                           // make sure that the input aint empty
            alert("Please Enter a Task First");
            return;
        }
        createListElement(taskList, inputElement.value);
        storeAtLocalStorage(mapIndexToStatus(index), inputElement.value);
        inputElement.value = "";
    })
}

function mapIndexToStatus(index) {
    switch(index){
        case 0: return "todo";
        case 1: return "in-progress";
        case 2: return "done";
    }  
}

function createListElement(list, inputValue) {
    const ulElementsList = document.getElementsByClassName("list");
    let newLi = document.createElement("LI");
    newLi.classList.add("task");
    newLi.innerText = inputValue;  

    newLi.addEventListener("mouseover", function() {
        document.addEventListener("keydown", whileHoverAndKeyPress);
    });
    newLi.addEventListener("mouseout", function() {
        document.removeEventListener("keydown", whileHoverAndKeyPress);
    })
    
    newLi.addEventListener("dblclick", function(){    // make editable by dblclick
        newLi.setAttribute("contenteditable", "true");
    }); 
    newLi.addEventListener("blur", function(){   
        const currentStatus = getCurrentStatus(ulElementsList, newLi.parentNode);
        updateLocalStorage(inputValue, currentStatus, newLi.innerText);
        newLi.setAttribute("contenteditable", "false");
    }); 
    list.prepend(newLi); 
    
    function whileHoverAndKeyPress(keypressEvent) {
        if (keypressEvent.altKey){
            const keyPressed = keypressEvent.key;
            const currentStatus = getCurrentStatus(ulElementsList, newLi.parentNode);
            if (keyPressed == 1){
                changeTaskStatusWithAlt(newLi, newLi.parentNode, currentStatus, newLi.innerText, keyPressed, ulElementsList);
            };
            if (keyPressed == 2){
                changeTaskStatusWithAlt(newLi, newLi.parentNode, currentStatus, newLi.innerText, keyPressed, ulElementsList);
            };
            if (keyPressed == 3){
                changeTaskStatusWithAlt(newLi, newLi.parentNode, currentStatus, newLi.innerText, keyPressed, ulElementsList);
            } ;
        }                 
    }   
}

function getCurrentStatus(ulElementsList, currentUl) {
    const currentStatusIndex = Array.from(ulElementsList).indexOf(currentUl);
    return mapIndexToStatus(currentStatusIndex);
}

function changeTaskStatusWithAlt(liElement, listElement, status, inputValue, keyPress, statusElementsList){
    listElement.removeChild(liElement); // remove the Li from the current status.
    statusElementsList[keyPress - 1].prepend(liElement); // move the Li to the new position (status).
    storeAtLocalStorage(mapIndexToStatus(keyPress - 1), inputValue);      // do the same in the storage.                             
    removeFromLocalStorage(status, inputValue);
}

function mapStatusToUlElement(status) {
    switch(status){
        case "todo": return document.getElementById("to-do-tasks-list");
        case "in-progress": return document.getElementById("in-progress-tasks-list");
        case "done": return document.getElementById("done-tasks-list"); 
    }  
}

function searchTask(){
    
}

// Local storage actions
function storeAtLocalStorage(status, value){  
    const oldData = JSON.parse(localStorage.getItem("tasks"));
    const stageOldData = oldData[status];
    stageOldData.unshift(value);  
    localStorage.setItem("tasks",JSON.stringify(oldData));
}

function removeFromLocalStorage(status, value){
    const oldData = JSON.parse(localStorage.getItem("tasks"));
    const statusOldData = oldData[status];
    statusOldData.splice(statusOldData.indexOf(value), 1);
    localStorage.setItem("tasks",JSON.stringify(oldData));
}

function updateLocalStorage (oldValue, status, newValue){
    const oldData = JSON.parse(localStorage.getItem("tasks"));
    const statusOldData = oldData[status];
    statusOldData[statusOldData.indexOf(oldValue)] = newValue;
    localStorage.setItem("tasks",JSON.stringify(oldData));
}

