import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import Sortable from "https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/+esm"



const appSettings = {
    databaseURL: "https://playground-1e07d-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")


const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

const sortable = new Sortable(shoppingListEl, {
    animation: 150,
    onEnd: function (evt) {
        updateOrderInDB()
    }
});

addButtonEl.addEventListener("click", addItem)
inputFieldEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        addItem()
    }
})

function addItem() {

    let inputValue = inputFieldEl.value

    inputValue.trim() !== "" ? push(shoppingListInDB, { value: inputValue, order: 0 }) : ""


    clearInputFieldEl()
}

onValue(shoppingListInDB, function (snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
        // Sort by order property before rendering
        itemsArray.sort((a, b) => a[1].order - b[1].order)

        clearShoppingListEl()

        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]

            appendItemToShoppingListEl(currentItem)
        }

    } else {
        shoppingListEl.innerHTML = "<h1>nothing here yet</h1>"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let itemData = item[1]

    let newEl = document.createElement("li")

    newEl.textContent = itemData.value
    newEl.setAttribute("data-id", itemID) // ← this is critical

    newEl.addEventListener("click", function () {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)

        remove(exactLocationOfItemInDB)
    })

    shoppingListEl.append(newEl)
}

function updateOrderInDB() {
    const items = shoppingListEl.querySelectorAll("li");

    items.forEach((item, index) => {
        const id = item.getAttribute("data-id")
        const itemRef = ref(database, `shoppingList/${id}`)
        update(itemRef, { order: index })

    });
}
