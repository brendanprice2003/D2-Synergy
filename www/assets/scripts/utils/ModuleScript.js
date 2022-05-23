import { itemTypeKeys } from "./SynergyDefinitions.js";
import { LoadCharacter, userStruct, homeUrl } from "../user.js";
import { ReturnEntry } from "./ValidateManifest.js";

const log = console.log.bind(console),
      localStorage = window.localStorage,
      sessionStorage = window.sessionStorage;

// Check if state query parameter exists in URL
const VerifyState = async () => {

    var urlParams = new URLSearchParams(window.location.search),
        state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = userStruct.homeUrl;
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};

// Redirect user back to specified url
// @string {url}, @string {param}
const RedirUser = (url, param) => {
    window.location.href = `${url}?${param ? param : ''}`;
};


// Returns corresponding class name using classType
// @int {classType}
const ParseChar = (classType) => {
    var r;
    switch (classType) {
        case 0:
            r='Titan';
            break;
        case 1:
            r='Hunter';
            break;
        case 2:
            r='Warlock';
            break;
        default:
            console.error('Could not parse character, parseChar() @function');
    };
    return r;
};


// Make element for entry data when hash is found in definitions
// @obj {param}
const MakeBountyElement = async (param) => {

    let itemOverlay = document.createElement('div'),
        itemStatus = document.createElement('img'),
        itemTitle = document.createElement('div'),
        itemType = document.createElement('div'),
        itemDesc = document.createElement('div'),
        item = document.createElement('img'),
        hr = document.createElement('hr');


    // Create bottom element
    item.className = `item`;
    item.id = `${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
    document.querySelector('#bountyItems').appendChild(item);

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Prop content of item
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;
    itemDesc.innerHTML = param.displayProperties.description;

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).append(itemTitle, itemType, hr, itemDesc);

    // Create item progress and push to DOM
    let rootIndex = param.objectiveDefinitions,
        completionCounter = 0;

    for (let indexCount=0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgCounter = document.createElement('div'),
            itemPrgDesc = document.createElement('div');

        // Check if progess string exceeds char limit
        if (rootIndex[indexCount].progressDescription.length >= 24) {

            var rt = rootIndex[indexCount].progressDescription.slice(0, 24);
            if (rt.charAt(rt.length - 1) === ' ') {
                rt = rt.slice(0, rt.length - 1); // Remove deadspaces at the end of strings
            };
            rootIndex[indexCount].progressDescription = rt + '..';
        };

        itemPrgCounter.className = 'itemPrgCounter';
        itemPrgDesc.className = 'itemPrgDesc';
        itemPrgCounter.id = `prgCounter_${rootIndex[indexCount].hash}`;
        itemPrgDesc.id = `prgDesc_${rootIndex[indexCount].hash}`;

        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgCounter);
        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgDesc);

        // Render item objective progress
        itemPrgDesc.innerHTML = rootIndex[indexCount].progressDescription;
        param.progress.forEach(h => {
            if (h.objectiveHash === rootIndex[indexCount].hash) {

                // Render objective progress
                if (rootIndex[indexCount].completionValue === 100) {
                    itemPrgCounter.innerHTML = `${h.progress}%`;
                }
                else if (rootIndex[indexCount].completionValue !== 100) {
                    itemPrgCounter.innerHTML = `${h.progress}/${h.completionValue}`;
                };

                // Check if objective is completed
                if (h.complete) {
                    completionCounter++;
                };
            };
        });

        // Calculate the nth term for seperating objectives
        let paddingStepAmount = 40 / (rootIndex.length) === Infinity ? (0) : (40 / (rootIndex.length));
        itemPrgCounter.style.paddingBottom = '21px';
        itemPrgDesc.style.paddingBottom = '20px';
        
        for (let padC=1; padC < rootIndex.length; padC++) { // Seperate objectives

            var offset = paddingStepAmount*indexCount;
            if (offset !== 0) {
                itemPrgCounter.style.paddingBottom = `${parseInt(itemPrgCounter.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
                itemPrgDesc.style.paddingBottom = `${parseInt(itemPrgDesc.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
            };
        };
    };

    // Mark item as complete
    if (param.progress.length === completionCounter) {
        param.areObjectivesComplete = true;
    }
    else if (param.progress.length !== completionCounter) {
        param.areObjectivesComplete = false;
    };

    // Mark item as expired
    if (param.isExpired && !param.areObjectivesComplete) {
        itemStatus.className = `expire`;
        itemStatus.id = `expire_${param.hash}`;
        itemStatus.src = './assets/icons/pursuitExpired.svg';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.className = `complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './assets/icons/pursuitCompleted.svg';
    };
    document.querySelector(`#bountyItems`).append(itemStatus);
    
    // Watch for mouse events
    item.addEventListener('mousemove', (e) => {
        let el = itemOverlay.style;
        el.display = 'inline-block';
        el.left = `${e.pageX}px`;
        el.top = `${e.pageY}px`;
    });

    item.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};


// Make general item element
const MakeItemElement = (param, type) => {

    let item = document.createElement('img');

    item.className = 'item2 grabElement';
    item.draggable = true;
    item.src = `https://www.bungie.net/${param.displayProperties.icon}`;
    document.querySelector(`#${type.toLowerCase()}Items`).appendChild(item);

    var img = document.createElement("img");
        img.src = `https://www.bungie.net/${param.displayProperties.icon}`;

    item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setDragImage(img, 0, 0);
    });
};


// Load weapons
const LoadWeapons = async (profileInventory, characterInventories, definitions) => {

    // Can no longer be called via user input
    userStruct.bools.characterWeaponsLoaded = true;

    var bucketDefinition = await ReturnEntry('DestinyInventoryBucketDefinition'),
        equippingBlockDefinition = await ReturnEntry('DestinyEquipmentSlotDefinition');

    // Load and push vault contents
    profileInventory.items.forEach(v => {

        let rt = definitions[v.itemHash];
        if (rt.itemType === 3) {
            
            let typeIdentifier = equippingBlockDefinition[rt.equippingBlock.equipmentSlotTypeHash].displayProperties.name.split(' ')[0]; // "Kinetic", etc.
            if (typeIdentifier === 'Kinetic') {
                rt.subWeaponTypeIdentifier = typeIdentifier;
                rt.weaponRarityLevel = rt.itemTypeAndTierDisplayName.split(' ')[0];
                userStruct.characterWeapons[typeIdentifier].push(rt);
            }
            else if (typeIdentifier === 'Energy') {
                rt.subWeaponTypeIdentifier = typeIdentifier;
                rt.weaponRarityLevel = rt.itemTypeAndTierDisplayName.split(' ')[0];
                userStruct.characterWeapons[typeIdentifier].push(rt);
            }
            else if (typeIdentifier === 'Power') {
                rt.subWeaponTypeIdentifier = typeIdentifier;
                rt.weaponRarityLevel = rt.itemTypeAndTierDisplayName.split(' ')[0];
                userStruct.characterWeapons[typeIdentifier].push(rt);
            };
        };
    });

    Object.keys(userStruct['characters']).forEach(characterId => {

        // Load and push character contents
        if (Object.keys(characterInventories[characterId].items).length !== 0) {
            characterInventories[characterId].items.forEach(v => {

                let rt = definitions[v.itemHash];
                if (rt.itemType === 3) {
    
                    let typeIdentifier = bucketDefinition[v.bucketHash].displayProperties.name.split(' ')[0]; // "Kinetic", etc.
                    if (typeIdentifier === 'Kinetic') {
                        rt.subWeaponTypeIdentifier = typeIdentifier;
                        rt.weaponRarityLevel = rt.itemTypeAndTierDisplayName.split(' ')[0];
                        userStruct.characterWeapons[typeIdentifier].push(rt);
                    }
                    else if (typeIdentifier === 'Energy') {
                        rt.subWeaponTypeIdentifier = typeIdentifier;
                        rt.weaponRarityLevel = rt.itemTypeAndTierDisplayName.split(' ')[0];
                        userStruct.characterWeapons[typeIdentifier].push(rt);
                    }
                    else if (typeIdentifier === 'Power') {
                        rt.subWeaponTypeIdentifier = typeIdentifier;
                        rt.weaponRarityLevel = rt.itemTypeAndTierDisplayName.split(' ')[0];
                        userStruct.characterWeapons[typeIdentifier].push(rt);
                    };
                };
            });
        };
    });


    // Loop over each children array in characterWeapons and sort via rarity
    // Loop over each children array in characterWeapons and sort via power // TBA
    // Push items to DOM
    userStruct.characterWeapons.Kinetic.sort(SortByRarity);
    userStruct.characterWeapons.Energy.sort(SortByRarity);
    userStruct.characterWeapons.Power.sort(SortByRarity);

    userStruct.characterWeapons.Kinetic.forEach(v => MakeItemElement(v, v.subWeaponTypeIdentifier));
    userStruct.characterWeapons.Energy.forEach(v => MakeItemElement(v, v.subWeaponTypeIdentifier));
    userStruct.characterWeapons.Power.forEach(v => MakeItemElement(v, v.subWeaponTypeIdentifier));
};


// Sorts items via power level
var SortByPower = (a, b) => {
    log(a, b);
};


// Sorts items via rarity
var SortByRarity = (a, b) => {

    // We check against this, when sorting the object
    var keys = [
        'Exotic',
        'Legendary',
        'Rare',
        'Uncommon',
        'Common'
    ];

    let stackLabelA = a.weaponRarityLevel,
        stackLabelB = b.weaponRarityLevel;
    
    // Check against previous and first index
    if (keys.indexOf(stackLabelA) < keys.indexOf(stackLabelB)) {
        return -1;
    }
    else if (keys.indexOf(stackLabelA) > keys.indexOf(stackLabelB)) {
        return 1;
    };
    return 0;
};


// Sorts by index of item in itemTypeKeys
var SortBountiesByType = (a, b) => {

    let stackLabelA = a.inventory.stackUniqueLabel,
        stackLabelB = b.inventory.stackUniqueLabel,
        stackTypeA,
        stackTypeB;
    
    // Remove numbers & get key names from stackUniqueLabel even if it contains _
    stackLabelA.split('.').forEach(v => {
        let keyFromStack = v.replace(/[0-9]/g, '');
        keyFromStack.includes('_') ? keyFromStack.split('_').forEach(x => itemTypeKeys.includes(x) ? stackTypeA = x : null) : itemTypeKeys.includes(v.replace(/[0-9]/g, '')) ? stackTypeA = v.replace(/[0-9]/g, '') : null;
    });
    stackLabelB.split('.').forEach(v => {
        let keyFromStack = v.replace(/[0-9]/g, '');
        keyFromStack.includes('_') ? keyFromStack.split('_').forEach(x => itemTypeKeys.includes(x) ? stackTypeB = x : null) : itemTypeKeys.includes(v.replace(/[0-9]/g, '')) ? stackTypeB = v.replace(/[0-9]/g, '') : null;
    });

    // Sort items by returning index
    if (itemTypeKeys.indexOf(stackTypeA) < itemTypeKeys.indexOf(stackTypeB)){
        return -1;
    };
    if (itemTypeKeys.indexOf(stackTypeA) > itemTypeKeys.indexOf(stackTypeB)){
        return 1;
    };
    return 0;
};


// Sort bounties via bounty type
var SortByType = (bountyArr, utils) => {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.sort(utils.sortBountiesByType);
        };
    });
    return bountyArr;
};


// Start loading sequence
const StartLoad = () => {
    document.getElementById('slider').style.display = 'block';
};


// Stop loading sequence
const StopLoad = () => {
    document.getElementById('slider').style.display = 'none';
};


// Log user out on request
const Logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = homeUrl;
};


// Seperate numbers using commas
// @int {num}
const InsertSeperators = (num) => {
    return `${num}`.split()[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


// Capitalize First letter of string
const CapitilizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


// Sort items into bounties
var ParseBounties = (charInventory, charObjectives, utils) => {

    var charBounties = [],
        amountOfBounties = 0;

    charInventory.forEach(v => {
        let item = utils.definitions[v.itemHash];
        if (item.itemType === 26) {

            // Add objectives to item
            item.progress = [];
            for (let prg of charObjectives[v.itemInstanceId].objectives) {
                item.progress.push(prg);
            };

            // Add other item information
            item.isExpired = new Date(v.expirationDate) < new Date(); 
            item.props = [];

            // Push item to arr
            charBounties.push(item);
            amountOfBounties++;
        };
    });
    return [charBounties, amountOfBounties];
};


// Push bounties to DOM
var PushToDOM = (bountyArr, utils) => {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        if (group.length !== 0) {
            group.forEach(item => {
                utils.MakeBountyElement(item);
                utils.amountOfBounties++;
            });
        };
    });
};


// Sort bounties via vendor group
var SortByGroup = (charBounties, utils) => {

    charBounties.forEach(v => {
        for (let i=1; i < utils.vendorKeys.length; i++) {
            if (utils.vendorKeys.length-1 === i) {
                utils.bountyArr['other'].push(v);
                break;
            }
            else if (utils.vendorKeys.length !== i) {
                if (v.inventory.stackUniqueLabel.includes(utils.vendorKeys[i])) {
                    utils.bountyArr[utils.vendorKeys[i]].push(v);
                    break;
                };
            };
        };
    });
    return utils.bountyArr;
};


// Calculate total XP gain from (active) bounties
var CalcXpYield = (bountyArr, utils) => {

    var totalXP = 0;
    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        
        if (group.length !== 0) {
            group.forEach(z => {

                for (let i=0; i<utils.itemTypeKeys.length; i++) {

                    let label = z.inventory.stackUniqueLabel;
                    if (label.includes(utils.itemTypeKeys[i])) {

                        if (label.includes('dreaming_city')) {
                            totalXP += utils.petraYields[utils.itemTypeKeys[i]];
                        }
                        else {
                            totalXP += utils.baseYields[utils.itemTypeKeys[i]];
                        };
                        break;
                    };
                };
            });
        };
    });
    return totalXP;
};


// Calculate season pass information
var CalculateXpForBrightEngram = async (seasonInfo, prestigeSeasonInfo, currentYield, seasonPassInfo) => {

    const level = seasonInfo.level,
    // const level = 128374,
          prestigeLevel = prestigeSeasonInfo.level;
    if (level < 100) {

        // Assume a BE is every n3,n7 levels
        let lastNum = parseInt(`${level}`.split('')[1]);
        if (lastNum >= 3 && lastNum < 7) { // progress to level 7

            let diff = 7 - lastNum,
                fullLvls = diff-1, // fullLvls is levels that contain 100k xp
                remainderXp = 0;

            remainderXp = (fullLvls * 100_000) + (100_000 - seasonInfo.progressToNextLevel);
            log('XP until next BE: ', remainderXp);
        }
        else if (lastNum >= 7 || lastNum < 3) { // progress to level 3
                
            if (lastNum <= 9) {
                if (lastNum >= 0 && lastNum < 3) {
                    
                    let diff = 3 - lastNum,
                        fullLvls = diff-1;
                    
                    return (fullLvls * 100_000) + (100_000 - seasonInfo.progressToNextLevel);
                }
                else {

                    let diff = 10 - lastNum,
                        fullLvls = diff + 3;
                
                    return (fullLvls * 100_000) + (100_000 - seasonInfo.progressToNextLevel);
                };
            };
        };
    }
    else if (level === 100) {

        // Assume BE is every n0,n5 levels
        let lastNum = parseInt(`${level}`.split('')[`${level}`.length-1]);
        if (lastNum >= 5 && lastNum < 9) { // Progress for 10nth rank
            
            let fullLvls = 9 - lastNum;

            return (100_000 * fullLvls) + (100_000 - prestigeSeasonInfo.progressToNextLevel);
        }
        else if (lastNum >= 7 || lastNum < 3) { // Progress for 5nth rank

            let fullLvls = 4 - lastNum;

            return (100_000 * fullLvls) + (100_000 - prestigeSeasonInfo.progressToNextLevel);
        };
    };
};


// Calculate percentage based on first parameter
var CalculatePercentage = async (a, b) => {
    return Math.trunc((100 * a) / b);
};


// Return season pass level, even when prestige level
var ReturnSeasonPassLevel = async (seasonInfo, prestigeSeasonInfo) => {
    
    var levelToReturn = 0;
    levelToReturn += seasonInfo.level;

    if (prestigeSeasonInfo.level !== 0) {
        levelToReturn += prestigeSeasonInfo.level;
    };
    return levelToReturn;
};


// Load first character on profile
var LoadPrimaryCharacter = async (characters) => {
    var lastChar = CacheReturnItem('lastChar');
    if (lastChar) { 
        LoadCharacter(lastChar);
    }
    else if (!lastChar) {
        LoadCharacter(characters[Object.keys(characters)[0]].classType);
    };
};


// Wrappers for localStorage userCache
var CacheAuditItem = async (key, value) => {

    // Configure userCache if it does not exist#
    if (!localStorage.getItem('userCache')) { localStorage.setItem('userCache', JSON.stringify({}))};
    
    var userCache = JSON.parse(localStorage.getItem('userCache'));
    userCache[key] = value;
    localStorage.setItem('userCache', JSON.stringify(userCache));
};
var CacheRemoveItem = async (key, value) => {
    var userCache = JSON.parse(localStorage.getItem('userCache'));
    delete userCache[key];
    localStorage.setItem('userCache', JSON.stringify(userCache));
};
var CacheReturnItem = (key, value) => {
    var userCache = JSON.parse(localStorage.getItem('userCache'));
    return userCache[key];
};



export {
    VerifyState,
    ParseChar,
    Logout,
    StartLoad,
    StopLoad,
    MakeBountyElement,
    MakeItemElement,
    RedirUser,
    InsertSeperators,
    CapitilizeFirstLetter,
    ParseBounties,
    PushToDOM,
    SortByGroup,
    SortByType,
    SortBountiesByType,
    CalcXpYield,
    CalculateXpForBrightEngram,
    CalculatePercentage,
    ReturnSeasonPassLevel,
    LoadPrimaryCharacter,
    LoadWeapons,
    CacheAuditItem,
    CacheRemoveItem,
    CacheReturnItem
};