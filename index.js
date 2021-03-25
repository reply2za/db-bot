const {google} = require("googleapis");
// comment out when deploying - GIT
// will have to replace with => process.env.stoken and make 'dotenv'
const keys = require("./DiscordBot-d96fd2d64ee5.json");

const client2 = new google.auth.JWT(keys.client_email, null, keys.private_key, [
    "https://www.googleapis.com/auth/spreadsheets",
]);

client2.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to google apis.");
    }
});

async function gsrun(cl, columnToRun, secondColumn, nameOfSheet) {
    const gsapi = google.sheets({version: "v4", auth: cl});

    nameOfSheet = nameOfSheet.toString();
    const spreadsheetSizeObjects = {
        spreadsheetId: keys.stoken,
        range: nameOfSheet + "!D1",
    };
    // String.fromCharCode(my_string.charCodeAt(columnToRun) + 1)
    let dataSizeFromSheets;
    try {
        dataSizeFromSheets = await gsapi.spreadsheets.values.get(
            spreadsheetSizeObjects
        );
        dataSize.set(nameOfSheet, dataSizeFromSheets.data.values);
    } catch (e) {
        await createSheetNoMessage(nameOfSheet);
        // gsUpdateAdd2(client2, 1,"D", nameOfSheet);
        dataSize.set(nameOfSheet, 1);
        return gsrun(cl, columnToRun, secondColumn, nameOfSheet);
    }

    // console.log("Data Size: " + dataSize.get(nameOfSheet));
    if (!dataSize.get(nameOfSheet)) {
        dataSize.set(nameOfSheet, 1);
        gsUpdateAdd2(cl, 1, "D", nameOfSheet);
        console.log("Data Size prev undef: " + dataSize.get(nameOfSheet));
        return gsrun(cl, columnToRun, secondColumn, nameOfSheet);
    }

    const songObjects = {
        spreadsheetId: keys.stoken,
        range:
            nameOfSheet +
            "!" +
            columnToRun +
            "2:" +
            secondColumn +
            "B" +
            dataSize.get(nameOfSheet).toString(),
    };

    let dataSO = await gsapi.spreadsheets.values.get(songObjects);
    const arrayOfSpreadsheetValues = dataSO.data.values;
    //console.log(arrayOfSpreadsheetValues);

    // console.log("Database size: " + dataSize.get(nameOfSheet));

    let line;
    let keyT;
    let valueT;
    congratsDatabase.clear();
    referenceDatabase.clear();
    let keyArray = [];
    for (let i = 0; i < dataSize.get(nameOfSheet); i++) {
        // the array of rows (has two columns)
        line = arrayOfSpreadsheetValues[i];
        if (!line) {
            continue;
        }
        keyT = line[0];
        keyArray.push(keyT);
        valueT = line[1];
        congratsDatabase.set(keyT, valueT);
        referenceDatabase.set(keyT.toUpperCase(), valueT);
    }
    return {
        congratsDatabase: congratsDatabase,
        referenceDatabase: referenceDatabase,
        line: keyArray
    };
}

function createSheet(message, nameOfSheet) {
    console.log("within create sheets");
    const gsapi = google.sheets({version: "v4", auth: client2});
    gsapi.spreadsheets.batchUpdate(
        {
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: nameOfSheet,
                            },
                        },
                    },
                ],
            },
        },
        function (err, response) {
            if (err) {
                // console.log('The API returned an error: ' + err);
            } else {
                gsrun(client2, "A", "B", message.guild.id).then(() => {
                });
            }
            // console.log("success: ", response);
        }
    );
}

async function deleteRows(message, sheetName, rowNumber) {
    const gsapi = google.sheets({version: "v4", auth: client2});
    let res;
    try {
        const request = {
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            ranges: [sheetName],
            includeGridData: false,
            auth: client2,
        };

        res = await gsapi.spreadsheets.get(request)
    } catch (error) {
        console.log("Error get sheetId")
    }

    console.log(res.data.sheets[0].properties.sheetId);
    let sheetId = res.data.sheets[0].properties.sheetId;

// ----------------------------------------------------------
    gsapi.spreadsheets.batchUpdate(
        {
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            resource: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: rowNumber,
                                endIndex: rowNumber + 1
                            }
                        }
                    }
                ],
            },
        },
        function (err, response) {
            if (err) {
                // console.log('The API returned an error: ' + err);
            } else {
                gsrun(client2, "A", "B", message.guild.id).then(() => {
                });
            }
            // console.log("success: ", response);
        }
    );
}


function createSheetNoMessage(nameOfSheet) {
    console.log("within create sheets");
    const gsapi = google.sheets({version: "v4", auth: client2});
    gsapi.spreadsheets.batchUpdate(
        {
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: nameOfSheet,
                            },
                        },
                    },
                ],
            },
        },
        function (err, response) {
            if (err) {
                // console.log('The API returned an error: ' + err);
            } else {
                gsUpdateAdd2(client2, 1, "D", nameOfSheet);
            }
            // console.log("success: ", response);
            return response;
        }
    );
    return {};
}

/**
 * Adds the entry into the column
 * @param {*} cl
 * @param {*} key
 * @param {*} link
 * @param {*} firstColumnLetter The key column letter, should be uppercase
 * @param {*} secondColumnLetter The link column letter, should be uppercase
 * @param nameOfSheet
 */
function gsUpdateAdd(
    cl,
    key,
    link,
    firstColumnLetter,
    secondColumnLetter,
    nameOfSheet
) {
    const gsapi = google.sheets({version: "v4", auth: cl});
    gsapi.spreadsheets.values
        .append({
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            range:
                nameOfSheet + "!" + firstColumnLetter + "2:" + secondColumnLetter + "2",
            includeValuesInResponse: true,
            insertDataOption: "INSERT_ROWS",
            responseDateTimeRenderOption: "FORMATTED_STRING",
            responseValueRenderOption: "FORMATTED_VALUE",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[key, link]],
            },
        })
        .then(
            function (response) {
                // Handle the results here (response.result has the parsed body).
                // console.log("Response", response);
            },
            function (err) {
                console.error("Execute error", err);
            }
        );

    gsUpdateOverwrite(cl, -1, 1, nameOfSheet);
}

function gsUpdateAdd2(cl, givenValue, firstColumnLetter, nameOfSheet) {
    const gsapi = google.sheets({version: "v4", auth: cl});
    gsapi.spreadsheets.values
        .append({
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            range: nameOfSheet + "!" + firstColumnLetter + "1",
            includeValuesInResponse: true,
            insertDataOption: "INSERT_ROWS",
            responseDateTimeRenderOption: "FORMATTED_STRING",
            responseValueRenderOption: "FORMATTED_VALUE",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[givenValue]],
            },
        })
        .then(
            function (response) {
                // Handle the results here (response.result has the parsed body).
                // console.log("Response", response);
            },
            function (err) {
                console.error("Execute error", err);
            }
        );
}

/**
 * Overwrites the cell D1.
 * @param cl the client auth
 * @param value the final DB value, overrides addOn unless negative
 * @param addOn the number to mutate the current DB size by
 * @param nameOfSheet the name of the sheet to change
 */
function gsUpdateOverwrite(cl, value, addOn, nameOfSheet) {
    if (value < 0) {
        try {
            value = parseInt(dataSize.get(nameOfSheet)) + addOn;
        } catch (e) {
            // console.log("Error caught gsUpdateOverview", value);
            value = 1;
            // console.log(e);
        }
    }
    const gsapi = google.sheets({version: "v4", auth: cl});
    gsapi.spreadsheets.values
        .update({
            spreadsheetId: "1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0",
            range: nameOfSheet + "!D1",
            includeValuesInResponse: true,
            responseDateTimeRenderOption: "FORMATTED_STRING",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[value]],
            },
        })
        .then(
            function (response) {
                // Handle the results here (response.result has the parsed body).
                // console.log("Response", response);
            },
            function (err) {
                console.error("Execute error", err);
            }
        );
    gsrun(cl, "A", "B", "entries").then();
}

//ABOVE IS GOOGLE API -------------------------------------------------------------
//ABOVE IS GOOGLE API -------------------------------------------------------------

const {Client} = require("discord.js");

// initialization
const bot = new Client();
const ytdl = require("ytdl-core-discord");

// UPDATE HERE - Before Git Push
const version = "5.1.1";
const latestRelease =
    "**Latest Release (5.1.x):**\n"
    +
    "- Random command now uses the same queue as everything else. (Ex: !r [key])"
    +
    "\n\n**Previous Release (5.0.x):**\n"
    +
    "- Personal database is now live! (Ex: !mkeys)";
var servers = {};
bot.login(keys.token);
var whatsp = "";

// the entire reason we built this bot
function contentsContainCongrats(message) {
    return (
        message.content.includes("grats") ||
        message.content.includes("gratz") ||
        message.content.includes("ongratulations")
    );
}

var keyArray;
var s;
process.setMaxListeners(0);

function skipSong(message) {
    if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
            queue: [],
        };
    }
    // in case of force disconnect
    if (
        !message.guild.client.voice ||
        !message.guild.voice ||
        !message.guild.voice.channel
    ) {
        servers[message.guild.id].queue = [];
        return;
    }
        // if server queue is not empty
        if (
            servers[message.guild.id].queue &&
            servers[message.guild.id].queue.length > 0
        ) {
            servers[message.guild.id].queue.shift();
            // if there is still items in the queue then play next song
            if (servers[message.guild.id].queue.length > 0) {
                whatspMap[message.member.voice.channel] =
                    servers[message.guild.id].queue[0];
                // get rid of previous dispatch
                playSongToVC(message, whatspMap[message.member.voice.channel], message.member.voice.channel);
            } else {
                if (message.member.voice && message.member.voice.channel) {
                    // get rid of previous dispatch
                    message.member.voice.channel.leave();
                    dispatcherMap[message.member.voice.channel] = undefined;
                }
                if (
                    whatspMap[message.member.voice.channel] &&
                    whatspMap[message.member.voice.channel].length > 0
                ) {
                    whatspMap[message.member.voice.channel] =
                        "Last Played:\n" + whatspMap[message.member.voice.channel];
                }
            }
        }
}

/**
 * Removes an item from the google sheets music database
 * @param message the message that triggered the bot
 * @param {string} keyName the key to remove
 * @param sheetName the name of the sheet to alter
 * @param sendMsgToChannel whether to send a response to the channel
 */
function runRemoveItemCommand(message, keyName, sheetName, sendMsgToChannel) {
    if (keyName) {
        gsrun(client2, "A", "B", sheetName).then(async (xdb) => {
            let couldNotFindKey = true;
            for (let i = 0; i < xdb.line.length; i++) {
                let itemToCheck = xdb.line[i];
                if (itemToCheck.toLowerCase() === keyName.toLowerCase()) {
                    i += 1;
                    couldNotFindKey = false;
                    await deleteRows(message, sheetName, i);
                    gsUpdateOverwrite(client2, -1, -1, sheetName);
                    // console.log("Removed: " + itemToCheck);
                    if (sendMsgToChannel) {
                        message.channel.send("*Removed '" + itemToCheck + "'*");
                    }
                }
            }
            if (couldNotFindKey && sendMsgToChannel) {
                gsrun(client2, "A", "B", sheetName).then(async (xdb) => {
                    let foundStrings = runSearchCommand(keyName, xdb).ss;
                    if (foundStrings && foundStrings.length > 0 && keyName.length > 1) {
                        message.channel.send("Could not find '" + keyName + "'.\n*Did you mean: " + foundStrings + "*");
                    } else {
                        message.channel.send("*Could not find '" + keyName + "'.*");
                    }

                });
            }
        });
    } else {
        if (sendMsgToChannel) {
            message.channel.send("Need to specify the key to delete.");
        }
    }

}

/**
 * The execution for all of the bot commands
 * @param message
 * @returns {Promise<void>}
 */
async function runCommandCases(message) {
    let args = message.content.replace(/\s+/g, " ").split(" ");
    console.log(args);
    let mgid = message.guild.id;
    let prefixString = prefix[mgid];
    if (!prefixString) {
        try {
            await gsrun(client2, "A", "B", "prefixes").then((xdb) => {
                // console.log(xdb.congratsDatabase);
                // console.log("Z1 Breakpoint: " + xdb.congratsDatabase.get(mgid));
                // console.log("Z2 Breakpoint: " + xdb.congratsDatabase.get(mgid.toString()));
                let newPrefix = xdb.congratsDatabase.get(mgid);
                if (!newPrefix) {
                    prefix[mgid] = "!";
                } else {
                    prefix[mgid] = newPrefix;
                }
            });
        } catch (e) {
            prefix[mgid] = "!";
            gsUpdateAdd(client2, mgid, "!", "A", "B", "prefixes");
        }
    }
    prefixString = prefix[mgid];
    if (args[0].substr(0, 1) !== prefixString) {
        if (args[0] === "!changeprefix" || args[0] === "!keys" || args[0] === "!h") {
            message.channel.send(
                "Current prefix is: " +
                prefixString
            );
        }
        return;
    }
    let statement = args[0].substr(1).toLowerCase();
    if (statement.substr(0,1) === "g") {
        if (message.member.id.toString() !== "443150640823271436" && message.member.id.toString() !== "268554823283113985") {
            return;
        }
    }
    switch (statement) {
        //!p is just the basic rhythm bot
        case "p":
            if (!message.member.voice.channel) {
                return;
            }
            if (!args[1]) {
                message.channel.send(
                    "Where's the link? I can't read your mind... unfortunately."
                );
                return;
            }
            if (!args[1].includes(".")) {
                message.channel.send(
                    "There's something wrong with what you put there."
                );
                return;
            }
            if (!servers[mgid])
                servers[mgid] = {
                    queue: [],
                };
            // in case of force disconnect
            if (
                !message.guild.client.voice ||
                !message.guild.voice ||
                !message.guild.voice.channel
            ) {
                servers[mgid].queue = [];
            }
            // push to queue
            servers[mgid].queue.push(args[1]);
            // if queue has only 1 song then play
            if (servers[mgid] && servers[mgid].queue.length < 2) {
                playSongToVC(message, args[1], message.member.voice.channel);
            } else {
                message.channel.send("*Added to queue*");
            }
            break;
        // !pn
        case "gpn":
            if (!message.member.voice.channel) {
                return;
            }
            if (!args[1]) {
                message.channel.send(
                    "Where's the link? I can't read your mind... unfortunately."
                );
                return;
            }
            if (!servers[mgid])
                servers[mgid] = {
                    queue: [],
                };
            // in case of force disconnect
            if (
                !message.guild.client.voice ||
                !message.guild.voice ||
                !message.guild.voice.channel
            ) {
                servers[mgid].queue = [];
            }
            if (!args[1].includes(".")) {
                runDatabasePlayCommand(args, message, "entries", true);
                return;
            }
            // push to queue
            servers[mgid].queue.unshift(args[1]);
            message.channel.send("*Playing now*");
            playSongToVC(message, args[1], message.member.voice.channel);
            break;
        case "pn":
            if (!message.member.voice.channel) {
                return;
            }
            if (!args[1]) {
                message.channel.send(
                    "Where's the link? I can't read your mind... unfortunately."
                );
                return;
            }
            if (!servers[mgid])
                servers[mgid] = {
                    queue: [],
                };
            // in case of force disconnect
            if (
                !message.guild.client.voice ||
                !message.guild.voice ||
                !message.guild.voice.channel
            ) {
                servers[mgid].queue = [];
            }
            if (!args[1].includes(".")) {
                runDatabasePlayCommand(args, message, mgid, true);
                return;
            }
            // push to queue
            servers[mgid].queue.unshift(args[1]);
            message.channel.send("*Playing now*");
            playSongToVC(message, args[1], message.member.voice.channel);
            break;
        // case '!pv':
        //     if (!args[1]) {
        //         message.channel.send("Where's the link? I can't read your mind... unfortunately.");
        //         return;
        //     }
        //     if (!(args[1].includes("youtube")) || !(args[1].includes(".com"))) {
        //         message.channel.send("There's something wrong with what you put there.");
        //         return;
        //     }
        //     if (!message.member.voice.channel) {
        //         return;
        //     }
        //     if (!servers[message.guild.id]) servers[message.guild.id] = {
        //         queue: []
        //     }
        //
        //     server = servers[message.guild.id];
        //     server.queue.push(args[1]);
        //     playSong(message, args[1], false);
        //     break;

        //!e is the Stop feature
        case "e":
            totalRandomIntMap[message.member.voice.channel] = 0;
            currentRandomIntMap[message.member.voice.channel] = 0;
            if (
                !message.member ||
                !message.member.voice ||
                !message.member.voice.channel
            ) {
                return;
            }
            dispatcherMap[message.member.voice.channel] = undefined;

            if (servers[mgid] && servers[mgid].queue) {
                servers[mgid].queue = [];
            }

            if (message.member.voice && message.member.voice.channel) {
                message.member.voice.channel.leave();
            }

            if (
                whatspMap[message.member.voice.channel] &&
                whatspMap[message.member.voice.channel].length > 0 &&
                !whatspMap[message.member.voice.channel].includes("Last Played:")
            ) {
                whatspMap[message.member.voice.channel] =
                    "Last Played:\n" + whatspMap[message.member.voice.channel];
            }
            break;

        // !s prints out the database size
        case "s":
            message.channel.send(
                "Database size: " + Array.from(congratsDatabase.keys()).length
            );
            break;

        // !gd is to run database songs
        case "gd":
            runDatabasePlayCommand(args, message, "entries", false);
            break;
        // !d
        case "d":
            runDatabasePlayCommand(args, message, mgid, false);
            break;
        // !md is the personal database
        case "md":
            runDatabasePlayCommand(args, message, "p"+message.member.id, false);
            break;
        // !r is a random that works with the normal queue
        case "r":
            if (!message.member.voice.channel) {
                return;
            }
            runRandomToQueue(args, message, mgid);
            break;
        // !gr is the global random to work with the normal queue
        case "gr":
            if (!message.member.voice.channel) {
                return;
            }
            runRandomToQueue(args, message, "entries");
            break;
        // !mr is the personal random that works with the normal queue
        case "mr":
            if (!message.member.voice.channel) {
                return;
            }
            runRandomToQueue(args, message, "p" + message.member.id);
            break;
        // !keys is server keys
        case "keys":
            runKeysCommand(message, prefixString, mgid, "");
            break;
        // !key
        case "key":
            runKeysCommand(message, prefixString, mgid, "");
            break;
        // !mkeys is personal keys
        case "mkeys":
            runKeysCommand(message, prefixString, "p"+message.member.id, "m");
            break;
        // !mkey is personal keys
        case "mkey":
            runKeysCommand(message, prefixString, "p"+message.member.id, "m");
            break;
        // !gkeys is global keys
        case "gkeys":
            runKeysCommand(message, prefixString, "entries", "g");
            break;
        // !gkey is global keys
        case "gkey":
            runKeysCommand(message, prefixString, "entries", "g");
            break;
        // !k is the search
        case "k":
            if (!args[1]) {
                message.channel.send("No argument was given.");
                return;
            }
            gsrun(client2, "A", "B", mgid).then(async (xdb) => {
                ss = runSearchCommand(args[1], xdb).ss;
                if (ss && ss.length > 0) {
                    message.channel.send("Keys found: " + ss);
                } else {
                    message.channel.send(
                        "Could not find any keys that start with the given letters."
                    );
                }
            });
            break;
        // !gk
        case "gk":
            if (!args[1]) {
                message.channel.send("No argument was given.");
                return;
            }
            gsrun(client2, "A", "B", "entries").then(async (xdb) => {
                ss = runSearchCommand(args[1], xdb).ss;
                if (ss && ss.length > 0) {
                    message.channel.send("Keys found: " + ss);
                } else {
                    message.channel.send(
                        "Could not find any keys that start with the given letters."
                    );
                }
            });
            break;
        // !? is the command for what's playing?
        case "?":
            runWhatsPCommand(args, message, mgid, mgid);
            break;
        case "g?":
            runWhatsPCommand(args, message, mgid, "entries");
            break;
        case "m?":
            runWhatsPCommand(args, message, mgid, "p" + message.member.id);
            break;
        case "changeprefix":
            if (!args[1]) {
                message.channel.send(
                    "No argument was given. Enter the new prefix after the command."
                );
                return;
            }
            if (args[1].length > 1) {
                message.channel.send(
                    "Prefix length cannot be greater than 1."
                );
                return;
            }
            if (args[1] === "+" || args[1] === "=") {
                message.channel.send("Cannot have " + args[1] + " as a prefix.");
                return;
            }
            args[2] = args[1];
            args[1] = mgid;
            await gsrun(client2, "A", "B", "prefixes").then(async () => {
                console.log("removed item");
                console.log(dataSize["prefixes"]);
                await gsrun(client2, "A", "B", "prefixes").then(() => {
                    runRemoveItemCommand(message, args[1], "prefixes", false);
                });
            });
            gsrun(client2, "A", "B", "prefixes").then(() => {
            runAddCommand(args, message, "prefixes", false);
            gsUpdateOverwrite(client2, -1, 1, "prefixes");
            });
            prefix[mgid] = args[2];
            message.channel.send("Prefix successfully changed to " + args[2]);
            break;
        // list commands for public commands
        case "h":
            sendHelp(message, prefixString);
            break;
        case "help":
            sendHelp(message, prefixString);
            break;
        // !skip
        case "skip":
            runSkipCommand(message,args);
            break;
        // !sk
        case "sk":
            runSkipCommand(message,args);
            break;
        // !pa
        case "pa":
            if (
                message.member.voice &&
                dispatcherMap[message.member.voice.channel]
            ) {
                dispatcherMap[message.member.voice.channel].pause();
                message.channel.send("*paused*");
            }
            break;
        // !pl
        case "pl":
            if (
                message.member.voice &&
                dispatcherMap[message.member.voice.channel]
            ) {
                dispatcherMap[message.member.voice.channel].resume();
                message.channel.send("*playing*");
            }
            break;
        // !v prints out the version number
        case "v":
            message.channel.send("version: " + version + "\n" + latestRelease);
            break;
        // !devadd
        case "devadd":
            if (message.member.id.toString() !== "443150640823271436" && message.member.id.toString() !== "268554823283113985") {
                return;
            }
            message.channel.send(
                "Here's link to add to the database:\n" +
                "https://docs.google.com/spreadsheets/d/1jvH0Tjjcsp0bm2SPGT2xKg5I998jimtSRWdbGgQJdN0/edit#gid=1750635622"
            );
            break;
        // !ga adds to the server database
        case "ga":
            if (!args[1] || !args[2]) {
                message.channel.send(
                    "Could not add to the database. Put a song key followed by a link."
                );
                return;
            }
            if (!args[2].includes(".")) {
                message.channel.send("You can only add links to the database.");
                return;
            }
            // in case the database has not been initialized
            gsrun(client2, "A", "B", "entries").then(() => {
                runAddCommand(args, message, "entries", true);
            });
            break;
        // !a is normal add
        case "a":
            if (!args[1] || !args[2]) {
                message.channel.send(
                    "Could not add to the database. Put a song key followed by a link."
                );
                return;
            }
            if (!args[2].includes(".")) {
                message.channel.send("You can only add links to the database.");
                return;
            }
            // in case the database has not been initialized
            gsrun(client2, "A", "B", mgid).then(() => {
                if (
                    !dataSize.get(mgid.toString()) ||
                    dataSize.get(mgid.toString()) < 1
                ) {
                    message.channel.send("Please try again.");
                } else {
                    runAddCommand(args, message, mgid, true);
                }
            });
            break;
        // !a is normal add
        case "ma":
            if (!args[1] || !args[2]) {
                message.channel.send(
                    "Could not add to the database. Put a song key followed by a link."
                );
                return;
            }
            if (!args[2].includes(".")) {
                message.channel.send("You can only add links to the database.");
                return;
            }
            // in case the database has not been initialized
            gsrun(client2, "A", "B", "p"+message.member.id).then(() => {
                if (
                    !dataSize.get("p"+message.member.id.toString()) ||
                    dataSize.get("p"+message.member.id.toString()) < 1
                ) {
                    message.channel.send("Please try again.");
                } else {
                    runAddCommand(args, message, "p"+message.member.id, true);
                }
            });
            break;
        // !rm removes database entries
        case "rm":
            runRemoveItemCommand(message, args[1], mgid, true);
            break;
        // !grm removes database entries
        case "grm":
            runRemoveItemCommand(message, args[1], "entries", true);
            break;
        // !rm removes database entries
        case "mrm":
            runRemoveItemCommand(message, args[1], "p"+message.member.id, true);
            break;
        case "invite":
            message.channel.send("Here's the invite link!\nhttps://discord.com/oauth2/authorize?client_id=730350452268597300&permissions=1133584&scope=bot");
            break;
        case "vol":
            if (!args[1]) {
                message.channel.send("Need to provide volume limit (1-10)");
                return;
            }
            if (!dispatcherMap[message.member.voice.channel]) {
                message.channel.send("Stream could not be found.");
                return;
            }
                try {
                    let newVol = parseInt(args[1]);
                    if (newVol < 11 && newVol > 0) {
                        dispatcherMap[message.member.voice.channel].setVolume(newVol/10);
                        message.channel.send("*volume set to " + newVol + "*");

                    } else {
                        message.channel.send("Need to provide volume limit (1-10)");
                    }
                } catch (e) {
                    message.channel.send("Need to provide volume limit (1-10)");
                }
            break;
        // !rand
        case "rand":
            if (args[1]) {
                const numToCheck = parseInt(args[1]);
                if (!numToCheck || numToCheck < 1) {
                    message.channel.send("Number has to be positive.");
                    return;
                }
                let randomInt2 = Math.floor(Math.random() * numToCheck) + 1;
                message.channel.send(
                    "Assuming " +
                    numToCheck +
                    " in total. Your number is " +
                    randomInt2 +
                    "."
                );
            } else {
                if (
                    message.member &&
                    message.member.voice &&
                    message.member.voice.channel
                ) {
                    const numToCheck = message.member.voice.channel.members.size;
                    if (numToCheck <= 1) {
                        message.channel.send(
                            "Need at least 2 people your voice channel."
                        );
                    }
                    let randomInt2 = Math.floor(Math.random() * numToCheck) + 1;
                    message.channel.send(
                        "Assuming " +
                        numToCheck +
                        " people. Your number is " +
                        randomInt2 +
                        "."
                    );
                    // message.channel.send("You need to input a upper limit");
                }
            }
            break;
    }
}

// parses message, provides a response
bot.on("message", (message) => {
    if (message.author.bot) return;

    if (contentsContainCongrats(message)) {
        if (message.author.bot) return;
        const messageArray = message.content.split(" ");
        for (let i = 0; i < messageArray.length; i++) {
            if (!servers[message.guild.id])
                servers[message.guild.id] = {
                    queue: [],
                };
            //servers[message.guild.id].queue.push(args[1]);
            let word = messageArray[i];
            console.log(word);
            if (
                (word.includes("grats") ||
                    word.includes("gratz") ||
                    word.includes("ongratulation")) &&
                !word.substring(0, 1).includes("!")
            ) {
                message.channel.send("Congratulations!");
                playSongToVC(message, "https://www.youtube.com/watch?v=oyFQVZ2h0V8", message.member.voice.channel);
                return;
            }
        }
    } else {
        runCommandCases(message);
    }
});

/**
 * The command to add a song to a given database.
 * @param {*} args The command arguments
 * @param {*} message The message that triggered the command
 * @param {*} currentBotGuildId the server/guild id
 * @param printMsgToChannel whether to print response to channel
 */
function runAddCommand(args, message, currentBotGuildId, printMsgToChannel) {
    let songsAddedInt = 0;
    let z = 1;
    while (args[z] && args[z + 1]) {
        let linkZ = args[z + 1];
        if (linkZ.substring(linkZ.length - 1) === ",") {
            linkZ = linkZ.substring(0, linkZ.length - 1);
        }
        gsUpdateAdd(client2, args[z], args[z + 1], "A", "B", currentBotGuildId);
        z = z + 2;
        songsAddedInt += 1;
    }
    if (printMsgToChannel) {
        if (songsAddedInt === 1) {
            message.channel.send("*Song successfully added to the database.*");
        } else if (songsAddedInt > 1) {
            gsrun(client2, "A", "B", currentBotGuildId).then(() => {
                gsUpdateOverwrite(client2, -1, songsAddedInt, currentBotGuildId);
                message.channel.send("*" + songsAddedInt + " songs successfully added to the database.*");
            });
        } else {
            message.channel.send("Please call '!keys' to initialize the database.");
        }
    }
}

/**
 * Executes play assuming that message args are intended for a database call.
 * The database referenced depends on what is passed in via mgid.
 * @param {*} args the message split by spaces into an array
 * @param {*} message the message that triggered the bot
 * @param {*} sheetname the name of the google sheet to reference
 * @param playRightNow bool of whether to play now or now
 * @returns
 */
function runDatabasePlayCommand(args, message, sheetname, playRightNow) {
    if (!args[1]) {
        message.channel.send(
            "There's nothing to play! ... I'm just gonna pretend that you didn't mean that."
        );
        return;
    }
    if (!message.member.voice.channel) {
        return;
    }
    if (!servers[message.guild.id] ) {
        servers[message.guild.id] = {
            queue: [],
        };
    }
    // in case of force disconnect
    if (
        !message.guild.client.voice ||
        !message.guild.voice ||
        !message.guild.voice.channel
    ) {
        servers[message.guild.id].queue = [];
    }

    gsrun(client2, "A", "B", sheetname).then((xdb) => {
        let queueWasEmpty = false;
        // if the queue is empty then play
        if (servers[message.guild.id].queue.length < 1) {
            queueWasEmpty = true;
        }
        if (args[2]) {
            let dbAddInt = 1;
            let unFoundString = "*Could not find: ";
            let firstUnfoundRan = false;
            let dbAddedToQueue = 0;
            while (args[dbAddInt]) {
                if (!xdb.referenceDatabase.get(args[dbAddInt].toUpperCase())) {
                    if (firstUnfoundRan) {
                        unFoundString = unFoundString.concat(", ");
                    }
                    unFoundString = unFoundString.concat(args[dbAddInt]);
                    firstUnfoundRan = true;
                } else {
                    // push to queue
                    servers[message.guild.id].queue.push(
                        xdb.referenceDatabase.get(args[dbAddInt].toUpperCase())
                    );
                    dbAddedToQueue++;
                }
                dbAddInt++;
            }
            message.channel.send("*Added " + dbAddedToQueue + " to queue*");
            if (firstUnfoundRan) {
                unFoundString = unFoundString.concat("*");
                message.channel.send(unFoundString);
            }
        } else {
            if (!xdb.referenceDatabase.get(args[1].toUpperCase())) {
                let ss = runSearchCommand(args[1], xdb).ss;
                if (ssi === 1 && ss && ss.length > 0 && args[1].length > 1 && (ss.length - args[1].length) < Math.floor((ss.length / 2) + 2)) {
                    message.channel.send(
                        "Could not find '" + args[1] + "'. **Assuming '" + ss + "'**"
                    );
                    // push to queue
                    servers[message.guild.id].queue.push(xdb.referenceDatabase.get(ss.toUpperCase()));
                } else if (ss && ss.length > 0) {
                    message.channel.send(
                        "Could not find '" + args[1] + "' in database.\n*Did you mean: " + ss + "*"
                    );
                    return;
                } else {
                    message.channel.send("Could not find '" + args[1] + "' in database.");
                    return;
                }
            } else {
                if(playRightNow) {
                    // push to queue
                    if (xdb.referenceDatabase.get(args[1].toUpperCase())) {
                        servers[message.guild.id].queue.unshift(xdb.referenceDatabase.get(args[1].toUpperCase()));
                        playSongToVC(message, xdb.referenceDatabase.get(args[1].toUpperCase()), message.member.voice.channel);
                        message.channel.send("*Playing now*");
                    } else {
                        message.channel.send("There's something wrong with what you put there.");
                    }
                    return;
                }
                // push to queue
                servers[message.guild.id].queue.push(xdb.referenceDatabase.get(args[1].toUpperCase()));
            }
            if (!queueWasEmpty) {
                message.channel.send("*Added to queue*");
            }
        }
        // if queue was empty then play
        if (queueWasEmpty && servers[message.guild.id].queue.length > 0) {
            playSongToVC(message, servers[message.guild.id].queue[0], message.member.voice.channel);
        }
    });
}

// The search command
let ss; // the search string
let ssi; // the number of searches found
/**
 * Searches the database for the keys matching args[1].
 * @param keyName the keyName
 * @param xdb the object containing multiple DBs
 * @returns {{ss: string, ssi: number}} ss being the found values, and ssi being the number of found values
 */
function runSearchCommand(keyName, xdb) {
    let givenSLength = keyName.length;
    let keyArray2 = Array.from(xdb.congratsDatabase.keys());
    ss = "";
    ssi = 0;
    let searchKey;
    for (let ik = 0; ik < keyArray2.length; ik++) {
        searchKey = keyArray2[ik];
        if (
            keyName.toUpperCase() ===
            searchKey.substr(0, givenSLength).toUpperCase() ||
            (keyName.length > 1 &&
                searchKey.toUpperCase().includes(keyName.toUpperCase()))
        ) {
            ssi++;
            if (!ss) {
                ss = searchKey;
            } else {
                ss += ", " + searchKey;
            }
        }
    }

    return {
        ss: ss,
        ssi: ssi
    };
}

/**
 * Function to skip songs once or multiple times depending on args
 * @param message the message that triggered the bot
 * @param args args[1] can optionally have number of times to skip
 */
function runSkipCommand(message, args) {
    if (args[1]) {
        try {
            let skipTimes = parseInt(args[1]);
            if (skipTimes > 0 && skipTimes < 101) {
                let skipCounter = 0;
                while (skipTimes !== 0 && servers[message.guild.id].queue.length > 0) {
                    skipSong(message);
                    skipTimes--;
                    skipCounter++;
                }
                if (skipCounter > 1) {
                    message.channel.send("*skipped " + skipCounter + " times*");
                } else {
                    message.channel.send("*skipped 1 time*");
                }
            } else {
                message.channel.send("*Invalid skip amount (should be between 1-100)\n skipped 1 time*");
                skipSong(message);
            }
        } catch (e) {
            skipSong(message);
            message.channel.send("*skipped*");
        }
    } else {
        skipSong(message);
    }
}

/**
 * Function to display help list.
 * @param {*} message the message that triggered the bot
 * @param {*} prefixString the prefix in string format
 */
function sendHelp(message, prefixString) {
    message.channel.send(
        "Help list:\n" +
        "--------------  Music Commands  -----------------\n" +
        prefixString +
        "p [youtube link]  -->  Plays YouTube video \n" +
        prefixString +
        "?  -->  What's playing\n" +
        prefixString +
        "pa  -->  pause \n" +
        prefixString +
        "pl  -->  play (if paused) \n" +
        prefixString +
        "sk  -->  Skip the current song\n" +
        prefixString +
        "e  -->  Stops playing and ends session\n" +
        prefixString +
        "pn [youtube link]  -->  Plays the link now, even if there is a queue.\n" +
        "\n-----------  Server Music Database  -----------  \n" +
        prefixString +
        "keys  -->  See all your saved songs \n" +
        prefixString +
        "a [song] [url]  -->  Adds a song to your database \n" +
        prefixString +
        "d [key]  -->  Play a song from your database \n" +
        prefixString +
        "k [phrase]  -->  lookup keys with the same starting phrase\n" +
        prefixString +
        "rm [key] -->  Removes a song from your database\n" +
        "*prepend 'm' to these commands to access your personal music database (ex: '!mkeys')*\n" +
        "\n--------------  Other Commands  -----------------\n" +
        prefixString +
        "changeprefix [new prefix]  -->  changes the prefix for all commands \n" +
        prefixString +
        "rand  --> random roll for the number of people in the voice channel\n" +
        "\n**Or just say congrats to a friend. I will chime in too! :) **"
    );
}

function runRandomToQueue(args, message, sheetname) {
    if (!servers[message.guild.id])
        servers[message.guild.id] = {
            queue: [],
        };
    randomQueueMap[message.guild.id] = undefined;
    gsrun(client2, "A", "B", sheetname).then((xdb) => {
        if (!args[1]) {
            addRandomToQueue(message, 1, xdb.congratsDatabase);
        } else {
            try {
                let num = parseInt(args[1]);
                if (num && num > 1000) {
                    message.channel.send("*max limit for random is 1000*");
                    num = 1000;
                }
                if (num) {
                    totalRandomIntMap[message.member.voice.channel] = num;
                }
                addRandomToQueue(message, num, xdb.congratsDatabase);
            } catch (e) {
                addRandomToQueue(message, 1, xdb.congratsDatabase);
            }
        }
    });
}

function addRandomToQueue(message, numOfTimes, cdb) {
    const rKeyArray = Array.from(cdb.keys());
    let rn;
    let queueWasEmpty = false;
    if (servers[message.guild.id].queue.length < 1) {
        queueWasEmpty = true;
    }
    try {
        if (!randomQueueMap[message.guild.id]) {
            let rKeyArrayFinal = [];
            let newArray = [];
            let executeWhileInRand = true;
            for (let i = 0; i < numOfTimes; i++) {
                if (!newArray || newArray.length < 1 || executeWhileInRand) {
                    let tempArray = [...rKeyArray];
                    let j = 0;
                    while (
                        (tempArray.length > 0 && j <= numOfTimes) ||
                        executeWhileInRand
                        ) {
                        let randomNumber = Math.floor(Math.random() * tempArray.length);
                        newArray.push(tempArray[randomNumber]);
                        tempArray.splice(randomNumber, 1);
                        j++;
                        executeWhileInRand = false;
                    }
                    // newArray has the new values
                }
                let aTest1 = newArray.pop();
                if (aTest1) {
                    rKeyArrayFinal.push(aTest1);
                } else {
                    executeWhileInRand = true;
                    i--;
                }
            }
            randomQueueMap[message.guild.id] = rKeyArrayFinal;
        }
    } catch (e) {
        console.log("error in random: " + e);
        rn = Math.floor(Math.random() * rKeyArray.length);
        randomQueueMap[message.guild.id] = [];
        randomQueueMap.push(rKeyArray[rn]);

    }
    randomQueueMap[message.guild.id].forEach(e => {
        servers[message.guild.id].queue.push(cdb.get(e));
    })
    if (queueWasEmpty && servers[message.guild.id].queue.length > 0) {
        playSongToVC(message,servers[message.guild.id].queue[0], message.member.voice.channel);
    }
}

/**
 * Grabs all of the keys/names from the database
 * @param {*} message The message trigger
 * @param prefixString The character of the prefix
 * @param {*} sheetname The name of the sheet to retrieve
 * @param cmdType the prefix to call the keys being displayed
 */
function runKeysCommand(message, prefixString, sheetname, cmdType) {
    if (
        !dataSize.get(sheetname.toString()) ||
        dataSize.get(sheetname.toString()) < 1
    ) {
        createSheet(message, sheetname);
    }
    gsrun(client2, "A", "B", sheetname).then((xdb) => {
        keyArray = Array.from(xdb.congratsDatabase.keys()).sort();
        s = "";
        for (let key in keyArray) {
            if (key == 0) {
                s = keyArray[key];
            } else {
                s = s + ", " + keyArray[key];
            }
        }
        if (!s || s.length < 1) {
            message.channel.send(
                "Your music database is empty. Add a song by calling '" +
                prefixString + cmdType +
                "a'"
            );
        } else {
            message.channel.send(
                "*(use '" + prefixString + cmdType + "d' to play)*\n **Keys:** " + s
            );
        }
    });
}

/**
 *  New play song function.
 * @param {*} message the message with channel info
 * @param {*} whatToPlay the link of the song to play
 * @param voiceChannel the voice channel
 */
function playSongToVC(message, whatToPlay, voiceChannel) {
    let server = servers[message.guild.id];
    if (voiceChannel.members.size < 1) {
        return;
    }
    let whatToPlayS = "";
    whatToPlayS = whatToPlay;
    whatsp = whatToPlayS;
    whatspMap[message.member.voice.channel] = whatToPlayS;
        voiceChannel.join().then(async function (connection) {
            try {
                await connection.voice.setSelfDeaf(true);
                let dispatcher = connection.play(await ytdl(whatsp), {
                    type: "opus",
                    filter: "audioonly",
                    quality: "140",
                });

                dispatcherMap[message.member.voice.channel] = dispatcher;
                dispatcher.on("finish", () => {
                    server.queue.shift();
                    if (server.queue.length > 0 && voiceChannel.members.size > 1) {
                        whatsp = server.queue[0];
                        // console.log("On finish, playing; " + whatsp);
                        whatspMap[message.member.voice.channel] = whatsp;
                        if (!whatsp) {
                            return;
                        }
                        playSongToVC(message, whatsp, voiceChannel);
                    } else {
                        connection.disconnect();
                        dispatcherMap[message.member.voice.channel] = undefined;
                    }
                });
            } catch (e) {
                // Error catching - fault with the yt link?
                console.log(
                    "Below is a caught error message. (tried to play:" + whatToPlayS + ")"
                );
                console.log("Error:", e);
                server.queue.shift();
                message.channel.send("Could not play song.");
                connection.disconnect();
            }
        });
}

/**
 * Runs the what's playing command. Can also look up database values if args[2] is present.
 * @param {*} args the message split into an array, delim by spaces
 * @param {*} message the message that activated the bot
 * @param {*} mgid The guild id
 * @param {*} sheetname The name of the sheet reference
 */
function runWhatsPCommand(args, message, mgid, sheetname) {
    if (args[1]) {
        gsrun(client2, "A", "B", sheetname).then((xdb) => {
            if (xdb.referenceDatabase.get(args[1].toUpperCase())) {
                message.channel.send(xdb.referenceDatabase.get(args[1].toUpperCase()));
            } else if (
                whatspMap[message.member.voice.channel] &&
                !whatspMap[message.member.voice.channel].includes("Last Played:")
            ) {
                message.channel.send(
                    "Could not find '" +
                    args[1] +
                    "' in database.\nCurrently playing: " +
                    whatspMap[message.member.voice.channel]
                );
            } else if (whatspMap[message.member.voice.channel]) {
                message.channel.send(
                    "Could not find '" +
                    args[1] +
                    "' in database.\n" +
                    whatspMap[message.member.voice.channel]
                );
            } else {
                message.channel.send("Could not find '" + args[1] + "' in database.");
            }
        });
    } else {
        if (
            whatspMap[message.member.voice.channel] &&
            whatspMap[message.member.voice.channel] !== ""
        ) {
            // in case of force disconnect
            if (
                !message.guild.client.voice ||
                !message.guild.voice ||
                !message.guild.voice.channel
            ) {
                if (
                    whatspMap[message.member.voice.channel] &&
                    !whatspMap[message.member.voice.channel].includes("Last Played:")
                ) {
                    whatspMap[message.member.voice.channel] =
                        "Last Played:\n" + whatspMap[message.member.voice.channel];
                    message.channel.send(whatspMap[message.member.voice.channel]);
                } else if (
                    whatspMap[message.member.voice.channel] &&
                    whatspMap[message.member.voice.channel].length > 0
                ) {
                    message.channel.send(whatspMap[message.member.voice.channel]);
                } else {
                    message.channel.send("Nothing is playing right now");
                }
                return;
            }
            if (
                servers[mgid] &&
                servers[mgid].queue &&
                servers[mgid].queue.length > 1
            ) {
                message.channel.send(
                    "(1/" +
                    servers[mgid].queue.length +
                    ")  " +
                    whatspMap[message.member.voice.channel]
                );
            } else {
                message.channel.send(whatspMap[message.member.voice.channel]);
            }
        } else {
            message.channel.send("Nothing is playing right now");
        }
    }
}


var whatspMap = new Map();
var prefix = new Map();
var congratsDatabase = new Map();
var referenceDatabase = new Map();
var currentRandomIntMap = new Map();
var totalRandomIntMap = new Map();
var dataSize = new Map();
var dispatcherMap = new Map();
var randomQueueMap = new Map();
