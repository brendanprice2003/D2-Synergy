### Formats (Standards) for Pursuit Entries

#### Base Structure

```
"<item.hash>": {
    "Destination": [],
    "ActivityMode": [],
    "DamageType": [],
    "ItemCategory": [],
    "AmmoType": [],
    "KillType": []
}
```

Each entry has the same props as shown above, however, each prop key has an array as the value. This array determines what identifier relates to that property in `SynergyDefinitions`. Using the `SynergyDefinitions` you can find the corresponding indexes for each prop. 

*Note: I moved to using string-based arrays instead of `key:value` pairs with item hashes.*


An entry may not have all the props that are shown above in the exemplar pursuit item. This is because when the prop does not have matching identifiers, it is omitted. (Below)

```
{
  "displayProperties": {
    "description": "Using a Submachine Gun, rapidly defeat combatants in groups of 2 or more.",
    "name": "Gun Runner",
    "icon": "/common/destiny2_content/icons/4a304e199f2adf9c12d03a19ef467666.png",
    "hasIcon": true
}
```

The above is the response from the API for that pursuit. From the pursuit description we are able to determine what props are related to the pursuit, using that description.


```
"709535749": {
    "Destination": [4],
    "ActivityMode": [1,2,16,18]
}
```

So we add the corresponding indexes for each prop and omit the props that do not contain related indexes.

If all the indexes from the related identifier (Arrays in `SynergyDefinitions`) can be matched to that prop, then you may keep either keep the prop but leave the value array empty like so:


```
"743499071": {
    "ActivityMode": [],
    "ItemCategory": [9],
    "KillType": [4],
}
```

<br>

Or you can go along and enter in all the indexes anyways. This would just mean that it's *less* readable somewhat since you would have to look through all the indexes and check to see if they are all included, or if one is being excluded.


```
"743499071": {
    "ActivityMode": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26],
    "ItemCategory": [9],
    "KillType": [4]
}
```