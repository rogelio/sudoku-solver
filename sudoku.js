// build the elements and map?
var ids = [];
var territory = [];

function buildSudoku(element) {
    buildGrid(element, map);
}
function buildGrid(element, map) {
    logg(map[8].available);

    var gridContainer = getId(element),
        addEventListener = (function() {
            if(document.addEventListener) return function(element, event, handler) { element.addEventListener(event, handler, false); };
            else return function(element, event, handler) { element.attachEvent('on' + event, handler); };
        }());

    for (var i = 0; i < map.length; i++) {
        makeElement("div", getId(element), { // create container for every textboxes.
            class: "gridBox blk" + map[i].block,
            id: "s"+map[i].id
        });
        makeElement("input", getClass("gridBox")[i], { // create textboxes and append in the container.
            type: "text",
            size: 1,
            maxlength: 1,
            name: map[i].unit,
            class: "gridInput blk" + map[i].block,
            id: map[i].unit,
            tabindex: i,
            value: ""
        });
        // for debugging.
        makeElement("div", getClass("gridBox")[i], { class: "available"});
        for (var j = 0; j < 9; j++) {
            makeElement("span", getClass("available")[i], { class: "num"});
        };
        update(getClass("available")[i], map[i].available);

        addEventListener(getClass("gridBox")[i], "click", function () {
            return highlight(getClass("gridBox"), this.id);
            //alert(recent);
        });
        addEventListener(getClass("gridInput")[i], "keyup", function (e) { 
            return keypress(e, this.tabIndex); 
        });
    }
}


function buildMap() {
    var rows = ['a', 'b', 'c', 'd', 'e', 'f', 'j', 'h' ,'i'], 
        cols = [1, 2, 3, 4, 5, 6, 7, 8, 9],
        size = cols.length * rows.length,
        map = [];
    for (var i = 0, x = 0, y = 0, step = 1, block = 0; i < size; i++, x++) {
        if (x == rows.length) {
            x = 0;
            y++;
            if (y % 3 == 0) {
                block = y;
                step = step + 3;
            }
        } 
        if (x % 3 == 0) {
            if (block % 3 == 0) block = step;
            else block++;
        }
        map[i] = {
            id: i,
            unit: rows[y] + cols[x], 
            row: rows[y],
            col: cols[x],
            block: block,
            available: cols,
            value: 0,
            oldValue: 0,
            duplicate: 0
        };
    }
    logg("map complete!");
    return map;
}

function keypress(e, index) {
    var value = String.fromCharCode(e.which);
    var clearKeys = { 8 : "", 32 : "", 46 : ""};
    if (e.which > 48 && e.which < 58) {
        if (map[index].value) {
            map = check(index, 0);
        }
        updateBox(index, value);
        map = check(index, value);

    } else if (e.which in clearKeys && map[index].value) {
        updateBox(index, "");
        map = check(index, 0);
    } else if (e.which == 9) {
        highlight(getClass("gridBox"), index);
    } else {
        if(!map[index].value)
            updateBox(index, "");
        return false;
    }                
    return map;
}
function check(index, value) {
    var value = parseInt(value);
    for (var i = 0; i < ids.length; i++) {
        if (value != 0) {
            map[ids[i]].available = register(ids[i], value, 0);
            if(isDuplicate(value, map[ids[i]].value)) {
                map[ids[i]].duplicate = 1;
                map[index].duplicate = 1;
            }
        } else {
            map[ids[i]].available = register(ids[i], map[index].oldValue, 1);
            if(isDuplicate(value, map[ids[i]].value)) {
                map[index].duplicate = 0;
            }
        }
        
        update(getClass("available")[ids[i]], map[ids[i]].available);
    }
    toggleClass(getClass("available")[index], "hide");
    map[index].oldValue = value;
    map[index].value = value;

    logMap("duplicate");
    return map;
}

function update(element, data) {
    element = element.childNodes;
    for (var i = 0; i < element.length; i++) {
        element[i].innerHTML = data[i];
    }
}
function updateBox(index, value) {
    return getClass("gridInput")[index].value = value;
}
function register(index, value, oldValue) {
    var available = [];
    for (var i = 0; i < 9; i++) {
        if (oldValue) {
            if (value - 1 == i)
                available.push(i + 1);
            else
                available.push(map[index].available[i]);
        } else {
            if (value - 1 == i)
                available.push(" ")
            else
                available.push(map[index].available[i]);
        }
    }
    return map[index].available = available;
}

function isDuplicate(from, to) {
    if (from == to && to != 0) {
        return true;
    } else {
        return false;
    }
}

function highlight(element, index) {
    var recent;
    if (typeof index == 'string')
        index = parseInt(index.slice(1));

    if (ids.length > 0) {
        recent = ids;
        for (var i = 0; i < recent.length; i++) {
            removeClass(element[recent[i]], "highlight");
        }        
    } 
    if (typeof territory[index] == "undefined") // if a copy doesn't exist, generate.
        ids = findIds(index);
    else // if copy does exist then use the copy.
        ids = territory[index];
    for (var i = 0; i < ids.length; i++) {
        addClass(element[ids[i]], "highlight");
    }
    territory[index] = ids;
    return ids;
}
// function that will find and return the unit's territory(rows, cols, block).
function findIds(index) {
    var row = 0, col = 0, block = 0, x, y, temp;
    var rows = [], cols = [], blocks = [];
    var sort = function (a, b) {
        return a - b;
    }
    // index - the column of the unit minus by 1 = the first unit of the row.
    row = index - (map[index].col - 1); 
    // index - the row = the first unit of the column. 
    col = index - row;
    for (var i = 0; i < 9; i++) {
        rows.push(row + i);
        cols.push(col);
        col += 9;

        if (map[rows[i]].block == map[index].block && x == undefined) x = i; //get the distance of x
        if (map[cols[i]].block == map[index].block && y == undefined) y = i; //get the distance of y        
    };

    /* distance of the unit in its y coordinates * 9, this will get the first cell 
    in the row of its block. Then add the distance of the unit in its x-coordinates.
    The result, the first index of the block.
    */
    block = y * 9 + x;
    for (var i = 0, j = 0; i < 9; i++) {
        if (j >= 3) {
            block += 6;
            j = 0;
        }
        blocks.push(block);
        block += 1;
        j++;
    };
    temp = rows.concat(cols, blocks);
    temp = temp.sort(sort);
    ids = [];
    for (var i = 0; i <= temp.length; i++) {
        if (temp[i] != temp[i + 1])
            ids.push(temp[i]);
    }
    return ids;
}

function logMap(child) {
    var arr = [];
    for (var i = 0; i < map.length; i++) {
        arr.push(map[i][child]);
    }
    logg(arr);
    logg("------------------------------------");
}
// debug
function logg(data) {
    var log = getId("log");
    log.appendChild(document.createTextNode(data));
    log.appendChild(document.createElement("br"));
}

// Create element function
function makeElement(element, container, attributes) {
    var property = ["id", "class", "name", "type", "size", "maxlength", "value", "tabindex", "onkeypress"];
    if (attributes.length < 3) property = '';
    else if (typeof attributes == 'object') {
        if (element != "input") property = property.slice(0, 2);
        element = document.createElement(element);
        for (var i = 0; i < property.length; i++) {
            if (property[i] in attributes) element.setAttribute(property[i], attributes[property[i]])
        }
    }
    return container.appendChild(element);
}

// Create textnode function
function appendText(data, container) {
    return container.appendChild(document.createTextNode(data));
}

// get class
function getClass(className) {
    return document.getElementsByClassName(className);
}

// get Id 
function getId(id) {
    return document.getElementById(id);
}

function addClass(element, className) {
    var classes = element.className.split(" "),
        index = 0;
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] == className) {
            index = i;
            break;
        }
    }
    if(!index) classes.push(className);
    return element.className = classes.join(" ");
}
function removeClass(element, className) {
    var classes = element.className.split(" "),
        index = 0;
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] == className) {
            index = i;
            break;
        }
    }
    if(index) classes[index] = "";
    return element.className = classes.join(" ");
}
function toggleClass(element, className) {
    var classes = element.className.split(" "),
        index = 0;
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] == className) {
            index = i;
            break;
        }
    }
    if(index) classes[index] = "";
    else classes.push(className);
    return element.className = classes.join(" ");
}