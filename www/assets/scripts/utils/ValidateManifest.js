import { get, set, clear } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

const requiredTables = [
    'DestinyInventoryItemDefinition',
    'DestinyObjectiveDefinition',
    'DestinySeasonDefinition',
    'DestinySeasonPassDefinition',
    'DestinyInventoryBucketDefinition',
    'DestinyEquipmentSlotDefinition'
];

var log = console.log.bind(console),
    manifest;



// Return manifest components
const ReturnComponentSuffix = async (entry) => {

    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    let components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];

    return components[entry];
};



// Check if each (required) table exists
const ValidateTables = async (isNewManifestVersionRequired) => {

    for (let table of requiredTables) {

        let entry = await get(table);
        if (!entry) {

            // Avoid CORS policies
            delete axios.defaults.headers.common['X-API-Key'];

            // Request/Set new table
            let suffix = await ReturnComponentSuffix(table),
                newTable = await axios.get(`https://www.bungie.net${suffix}`);

            set(table, newTable.data);
        };
    };
};



// Update the manifest when a new version is out
const UpdateManifest = async () => {

    clear(); // Wipe idb bc :)
    for (let table of requiredTables) {

        // Avoid gat damn CORS policies
        delete axios.defaults.headers.common['X-API-Key'];

        let suffix = await ReturnComponentSuffix(table),
            newTable = await axios.get(`https://www.bungie.net${suffix}`);
        
        set(table, newTable.data); // Set new table, yay
    };
};



// Check manifest version
const ValidateManifest = async () => {

    // Try to use previous response - if it exists
    if (!manifest) {

        // Change load content
        document.getElementById('loadingText').innerHTML = 'Downloading New Manifest';

        // Fetch manifest
        let localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);

        // Check manifest version
        if (localStorageManifestVersion !== manifest.data.Response.version) {
            log(localStorageManifestVersion, manifest.data.Response.version);
            await UpdateManifest();
            window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version);
        };
    };
};



// Return passed component
const ReturnEntry = async (entry) => {

    let res = await get(entry);
    if (!res) {
        await ValidateTables();
        res = await get(entry);
    };

    return res;
};



export { ValidateManifest, ReturnEntry };