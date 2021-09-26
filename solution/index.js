// Inserting the initial state.
if (localStorage.getItem("tasks") == null) {                                      //local storage
    localStorage.setItem("tasks", JSON.stringify({                   
        "todo": [],
        "in-progress": [],
        "done": []
    }));
}
else{ 
    reloadPage()
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
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("magnifying-glass");
const loadButton = document.getElementById("load-btn");
const saveButton = document.getElementById("save-btn");
searchButton.addEventListener("click", searchTask);
searchInput.addEventListener("input", searchTask);
loadButton.addEventListener("click", loadDataFromApi);
saveButton.addEventListener("click", saveDataToApi);

function reloadPage() {
    const localStoreTasks = JSON.parse(localStorage.getItem("tasks"));
    for (let [status, tasks] of Object.entries(localStoreTasks)) {
        for (let task of tasks){
            createListElement(mapStatusToUlElement(status), task);
        }
    }
}

function clearAllTasks(){
    const ulElement = document.getElementsByClassName("list");
    for ( let ul of ulElement){
        ul.innerHTML = "";
    }
}

function addLodingElement(isLoad){
    const loaderElement = document.createElement("DIV");
    const loaderElementId = isLoad ? "load-loader" : "save-loader";
    loaderElement.classList.add("loader");
    loaderElement.innerText = "Loading...";
    loaderElement.id = loaderElementId;
    const addLoaderToElement = isLoad ? loadButton : saveButton;
    addLoaderToElement.append(loaderElement);
}

function removeLodingElement(isLoad){
    const loaderElementId = isLoad ? "load-loader" : "save-loader";
    const loaderElement = document.getElementById(loaderElementId);
    loaderElement.remove(); 
}

async function loadDataFromApi(){
    addLodingElement(true);
    const downlodingResponse = await fetch("https://json-bins.herokuapp.com/bin/614b1a584021ac0e6c080cea", {
        method : "GET"
    });
    const response = await downlodingResponse.json();
    const dataObj =  response.tasks;
    if (downlodingResponse.status != 200 ){
        alert ("An error has occured when trying to send the data to the server. error status: "
            + downlodingResponse.status + " error message: " + downlodingResponse.statusText);
        return
    }
    localStorage.setItem("tasks", JSON.stringify(dataObj));
    clearAllTasks()
    reloadPage()
    removeLodingElement(true);
}

async function saveDataToApi(){
    addLodingElement(false);
    const uploadResponse = await fetch("https://json-bins.herokuapp.com/bin/614b1a584021ac0e6c080cea",{
        method : "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ tasks: JSON.parse(localStorage.getItem("tasks"))})
    });
    if (uploadResponse.status != 200 ){
        alert ("An error has occured when trying to send the data to the server. error status: "
            + uploadResponse.status + " error message: " + uploadResponse.statusText);
        return
    }
    removeLodingElement(false);
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
            if (keyPressed >= 1 && keyPressed<= 3){
                changeTaskStatusWithAlt(newLi, newLi.parentNode, currentStatus, newLi.innerText, keyPressed, ulElementsList);
            };
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
    const allTask  = document.getElementsByTagName("LI");
    for ( let task of allTask){
        task.hidden = false;
    } 
    for (let index = 0 ; index < sectionList.length ; index++){
        const section = sectionList[index];
        const ulElement = section.getElementsByClassName("list");
        const taskList = ulElement[0].childNodes;
        const tasksArray = [];
        for (let i = 0 ; i < taskList.length ; i ++){
            const task = taskList[i].innerText;
            const taskToLowerCase = task.toString().toLowerCase();
            tasksArray.push(taskToLowerCase);          
            if (taskToLowerCase.indexOf(searchInput.value) === -1 ){
                taskList[i].hidden = true;
            }
        } 
    }
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

