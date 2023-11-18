const storageButton = document.querySelector("#favorite");
storageButton.addEventListener("click", function () {
    loadSavedPokemon();
});

function createFavoriteButton() {
    let saveButton = document.createElement("button");
    saveButton.id = "save";
    saveButton.textContent = "Favorite";
    graphicsSectionDiv.appendChild(saveButton);
    
    saveButton.addEventListener("click", function () {
        savePokemon(infoMap.get("Id"));
    });
}

function savePokemon(id) {
    if (window.accountName === undefined) {
        alert("You must be logged in to save a Pokemon!");
        return;
    }

    if (AlreadySaved(id)) {
        alert("This Pokemon is already saved!");
        return;
    }

    let existingValue = localStorage.getItem(`${accountName}-fav-pkm`);
    if (existingValue === null) {
        existingValue = "";
    }

    existingValue += `${id}|`;
    localStorage.setItem(`${accountName}-fav-pkm`, existingValue);
}

function AlreadySaved(id) {
    if (window.accountName === undefined) {
        alert("You must be logged in to check saved Pokemon!");
        return false;
    }

    let existingValue = localStorage.getItem(`${accountName}-fav-pkm`);
    if (existingValue === null) {
        existingValue = "";
    }

    const savedIds = existingValue.split("|");
    if (savedIds.includes(id.toString())) {
        return true;
    } else {
        return false;
    }
}

function loadSavedPokemon() {
    if (window.accountName === undefined) {
        alert("You must be logged in to load saved Pokemon!");
        return;
    }

    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = "";

    const favoritePokemon = localStorage.getItem(`${accountName}-fav-pkm`);
    if (favoritePokemon === null || favoritePokemon === "") {
        return;
    }

    const pokemonIds = favoritePokemon.split("|");
    for (let i = 0; i < pokemonIds.length - 1; i++) {
        fetchPokemonData(`https://pokeapi.co/api/v2/pokemon/${pokemonIds[i]}`)
    }
}
