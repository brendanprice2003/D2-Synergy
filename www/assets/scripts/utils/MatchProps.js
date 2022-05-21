import { userStruct } from '../user.js';
import { bountyHashes } from './data/bounties.js';
import {
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType,
    CrucibleGameModes } from './SynergyDefinitions.js';

    const log = console.log.bind(console);
    var bountyPropCount = {};


// Push the props onto charBounties
const PushProps = async () => {

    // Clear counters
    bountyPropCount = {};

    // Loop over charBounties and append counters
    for (let i=0; i < userStruct.charBounties.length; i++) {

        let hash = userStruct.charBounties[i].hash,
            entry = bountyHashes[hash];

        for (let property in entry) {

            if (entry[property].length !== 0) {

                var propNames = [];
                for (let index of entry[property]) {

                    var arr = {};
                    if (property === 'Destination') {
                        arr=Destination;
                    }
                    else if (property === 'ActivityMode') {
                        arr=ActivityMode;
                        ActivityModeBuilder(index, entry, property);
                    }
                    else if (property === 'DamageType') {
                        arr=DamageType;
                    }
                    else if (property === 'ItemCategory') {
                        arr=ItemCategory;
                    }
                    else if (property === 'AmmoType') {
                        arr=AmmoType;
                    }
                    else if (property === 'KillType') {
                        arr=KillType;
                    };
                    propNames.push(arr[index]);
                };

                // Wtf does this even do?
                for (let bar of propNames) {

                    if (bountyPropCount[bar] === undefined) {
                        bountyPropCount[bar] = 0;
                        bountyPropCount[bar] += 1;
                    }
                    else if (bountyPropCount[bar] !== undefined) {
                        bountyPropCount[bar] += 1;
                    };

                    userStruct.charBounties[i].props.push(bar);
                };
            };
        };
    };
};


const ActivityModeBuilder = (index, entry, property) => {

    // If activity mode is crucible
    if (index === 3) {
        for (var gameMode in CrucibleGameModes) {
            if (CrucibleGameModes[gameMode] in entry[property]) {
                log(entry[property]);
            };
        };
        // entry[property].push(4,5,6,7,8,9,10,11,12,13,17,21,22,23,24,25);
    };
};
 

export { bountyPropCount, PushProps };