const poke_URL = "https://pokeapi.co/api/v2/pokemon/";
const pokeSpecies_URL = "https://pokeapi.co/api/v2/pokemon-species/";
let statGraph = null;
let dexNumber;
let pokeColor;

const searchButton = document.querySelector("#search");
searchButton.addEventListener("click", function () {
    const resultsElement = document.getElementById("results2");
    resultsElement.innerHTML = "";
    handleSearch();
});

const searchInput = document.querySelector("#searchterm2");
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

function handleSearch() {
    const searchInput = document.querySelector("#searchterm2");
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== "") {
        const pokemon = searchTerm.toLowerCase();
        getPokemon(pokemon);
    }
}

function formatString(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

async function getPokemon(pokemon) {
    try {
        const pokeSpecies_response = await fetch(`${pokeSpecies_URL}${pokemon}`);
        if (pokeSpecies_response.ok) {
            const pokeSpecies_data = await pokeSpecies_response.json();
            dexNumber = pokeSpecies_data.id;

            const poke_response = await fetch(`${poke_URL}${dexNumber}`);
            if (poke_response.ok) {
                const poke_data = await poke_response.json();
                clearResults();
                const pokemonInfo = getPokemonInfo(poke_data);
                const speciesInfo = getSpeciesInfo(pokeSpecies_data);
                createInfographic(pokemonInfo, speciesInfo);

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

function clearResults() {
    const results = document.getElementById("results2");

    if (results) {
        const existingCanvas = results.querySelector("canvas");
        if (existingCanvas) {
            existingCanvas.remove();
        }
    }

    results.innerHTML = "";
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

function createInfographic(pokeMap, speciesMap) {
    const results = document.getElementById("results2");
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
        { type: "p", key: "EggGroup", prefix: "Egg Group: " },
        { type: "p", key: "Color", prefix: "Color: " }
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

    // createStatGraph(infoMap.get("Stats"));

    let saveButton = document.createElement("button");
    saveButton.id = "save";
    saveButton.textContent = "Save";
    results.appendChild(saveButton);

    saveButton.addEventListener("click", function () {
        savePokemon(infoMap.get("Id"));
    });
}

/*
function createStatGraph(statsData) {
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
    const results = document.getElementById("results");

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

function savePokemon(id) {

}