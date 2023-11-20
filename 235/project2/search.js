const poke_URL = "https://pokeapi.co/api/v2/pokemon/";
const pokeSpecies_URL = "https://pokeapi.co/api/v2/pokemon-species/";
let statGraph = null;
let dexNumber;
let pokeColor;

const searchButton = document.querySelector("#search");
searchButton.addEventListener("click", function () {
    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = "";
    handleSearch();
});

const searchInput = document.querySelector("#searchterm");
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    localStorage.setItem("FavPokemon", "");
});

const storageButton = document.querySelector("#load");
storageButton.addEventListener("click", function () {
    loadPokemon();
});

function handleSearch() {
    const search1 = document.querySelector("#searchterm");
    const search2 = document.querySelector("#searchterm2");
    const term1 = search1.value.trim();
    const term2 = search2.value.trim();

    if (search1 !== "" && search2 !== "") {
        pkm1 = term1.toLowerCase();
        pkm2 = term2.toLowerCase();

        getPokemon(pkm1, "results");
        getPokemon(pkm2, "results2");
    }
    else if (search1 == "") {
        console.log(`An error occurred trying to fetch search 1 data from ${poke_URL}`);
    }
    else if (search2 == "") {
        console.log(`An error occurred trying to fetch search 2 data from ${poke_URL}`);
    }
    else {
        console.log(`An error occurred trying to fetch both search data from ${poke_URL}`);
    }
}

function formatString(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

async function getPokemon(pokemon, correctDiv) {
    try {
        const pokeSpecies_response = await fetch(`${pokeSpecies_URL}${pokemon}`);
        if (pokeSpecies_response.ok) {
            const pokeSpecies_data = await pokeSpecies_response.json();
            dexNumber = pokeSpecies_data.id;

            const poke_response = await fetch(`${poke_URL}${dexNumber}`);
            if (poke_response.ok) {
                const poke_data = await poke_response.json();
                clearResults("results","results2");
                const pokemonInfo = getPokemonInfo(poke_data);
                const speciesInfo = getSpeciesInfo(pokeSpecies_data);
                createInfographic(pokemonInfo, speciesInfo, correctDiv);

            } else {
                console.log(`An error occurred trying to fetch data from ${poke_URL}`);
            }
        } else {
            console.log(`An error occurred trying to fetch data from ${pokeSpecies_URL}`);
        }
    } catch (error) {
        console.log(`An error occurred during getPokemon()\nError: ${error}`);
    }
}

function clearResults(chosenDiv,otherDiv) {
    const results = document.getElementById(chosenDiv);
    const results2 = document.getElementById(otherDiv);

    if (results) {
        const existingCanvas = results.querySelector("canvas");
        if (existingCanvas) {
            existingCanvas.remove();
        }
    }

    results.innerHTML = "";
    results2.innerHTML = "";
}

function getPokemonInfo(data) {
    const pokemonMap = new Map([
        ['Name', formatString(data.name)],
        ['Id', data.id],
        ['Type', data.types.map((type) => formatString(type.type.name))],
        ['Ability', data.abilities
            .filter((ability) => !ability.is_hidden)
            .map((ability) => formatString(ability.ability.name))],
        ['HiddenAbility', data.abilities
            .filter((ability) => ability.is_hidden)
            .map((ability) => formatString(ability.ability.name))],
        ['Weight', data.weight],
        ['Height', data.height],
        ['Stats', data.stats],
        ['MaleDefaultImage', data.sprites.front_default],
        ['FemaleDefaultImage', data.sprites.front_female],
        ['MaleDefaultShinyImage', data.sprites.front_shiny],
        ['FemaleShinyImage', data.sprites.front_shiny_female],
        ['DefaultArtwork', data.sprites.other['official-artwork'].front_default],
        ['ShinyArtwork', data.sprites.other['official-artwork'].front_shiny]
    ]);

    return pokemonMap;
}

function getSpeciesInfo(data) {
    const pokemonMap = new Map([
        ['Color', formatString(data.color.name)],
        ['EggGroup', data.egg_groups.map((group) => formatString(group.name))]
    ]);

    return pokemonMap;
}

function tempStats(response) {
    let pokeStats = document.querySelector("#pokeStats");
    pokeStats.innerHTML = "Base Stats:<br>";
    response.stats.forEach(stat => {
        pokeStats.innerHTML += '${stat.stat.name}: ${stat.base_stat}<br>';
    });
}

function createInfographic(pokeMap, speciesMap, chosenDiv) {
    console.log(chosenDiv);

    const results = document.getElementById(chosenDiv);

    console.log(results);

    const infoMap = new Map([...pokeMap, ...speciesMap]);

    results.classList.add('infographic');

    const elementTypes = [
        { type: "h1", key: "Name" },
        { type: "img", key: "DefaultArtwork" },
        { type: "p", key: "Id", prefix: "ID: " },
        { type: "p", key: "Type", prefix: "Type: " },
        { type: "p", key: "Ability", prefix: "Ability: " },
        { type: "p", key: "HiddenAbility", prefix: "Hidden Ability: " },
        { type: "p", key: "Weight", prefix: "Weight: " },
        { type: "p", key: "Height", prefix: "Height: " },
    ];

    elementTypes.forEach(({ type, key, prefix = "" }) => {
        const element = document.createElement(type);
        if (type === "img") {
            element.src = infoMap.get(key);
        } else {
            element.textContent = `${prefix}${infoMap.get(key)}`;
        }
        results.appendChild(element);
    });

    // createStatGraph(infoMap.get("Stats"),chosenDiv);
    // tempStats(infoMap.get("Stats"));

    // Save Pokemon
    let saveButton = document.createElement("button");
    saveButton.id = "save";
    saveButton.textContent = "Save";
    results.appendChild(saveButton);

    saveButton.addEventListener("click", function () {
        savePokemon(infoMap.get("Id"));
    });
}

function savePokemon(id) {
    if (AlreadySaved(id)) {
        alert("This Pokemon is already saved!");
        return;
    }

    let existingValue = localStorage.getItem(`FavPokemon`);
    if (existingValue === null) {
        existingValue = "";
    }

    existingValue += `${id}|`;
    localStorage.setItem(`FavPokemon`, existingValue);
}

function AlreadySaved(id) {
    let existingValue = localStorage.getItem(`FavPokemon`);
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

function loadPokemon() {
    const resultsElement = document.getElementById("results");
    const resultsElement2 = document.getElementById("results2");
    resultsElement.innerHTML = "";
    resultsElement2.innerHTML = "";

    const favoritePokemon = localStorage.getItem(`FavPokemon`);
    if (favoritePokemon === null || favoritePokemon === "") {
        return;
    }

    const pokemonIds = favoritePokemon.split("|");
    for (let i = 0; i < pokemonIds.length - 1; i++) {
        fetchPokemonData(`https://pokeapi.co/api/v2/pokemon/${pokemonIds[i]}`)
    }
}

function fetchPokemonData(pokemonUrl) {
    fetch(pokemonUrl)
        .then(response => response.json())
        .then(pokemonData => {
            createShowcase(pokemonData);
        })
        .catch(error => {
            console.log(`An error occurred while fetching Pokémon data\nError: ${error}`);
        });
}

function createShowcase(pokemonData) {
    const pokemonName = pokemonData.name;
    const pokemonSprite = pokemonData.sprites.front_default;
    const pokemonId = pokemonData.id;
    const resultsElement = document.getElementById('results');

    const pokemonDiv = document.createElement('div');
    pokemonDiv.id = `pokemon${pokemonId}`;

    const nameElement = document.createElement('h2');
    nameElement.textContent = pokemonName;

    const spriteElement = document.createElement('img');
    spriteElement.src = pokemonSprite;
    spriteElement.alt = pokemonName;
    spriteElement.classList.add('cursorChange');

    spriteElement.addEventListener('click', function () {
        // resultsElement.innerHTML = '';
        getPokemon(pokemonName);
    });

    pokemonDiv.appendChild(nameElement);
    pokemonDiv.appendChild(spriteElement);

    resultsElement.appendChild(pokemonDiv);
    resultsElement.classList.remove('infographic');
    resultsElement.classList.add('showcase');
}

/*
function createStatGraph(statsData, chosenDiv) {
    const statNameMap = {
        "hp": "HP",
        "attack": "Atk",
        "defense": "Def",
        "special-attack": "SpA",
        "special-defense": "SpD",
        "speed": "Spe"
    };

    if (statGraph) {
        statGraph.destroy();
    }

    let labels = statsData.map(stat => statNameMap[stat.stat.name]);
    let values = statsData.map(stat => stat.base_stat);

    const results = document.getElementById(chosenDiv);

    let div = document.createElement("div");
    div.id = "stats";
    let canvas = document.createElement("canvas");
    canvas.id = "statChart";
    results.appendChild(div);
    div.appendChild(canvas);

    let ctx = canvas.getContext("2d");
    statGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Base Stats',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}
*/

function ApplyStyles(infoMap) {
    const results = document.getElementById("results");
    const infoSectionDiv = document.querySelector('.infoSection');
    const titleSectionDiv = document.querySelector('.titleSection');
    const aboutSectionDiv = document.querySelector('.aboutSection');
    const battleSectionDiv = document.querySelector('.battleSection');
    const graphicsSectionDiv = document.querySelector('.graphicsSection');
}

