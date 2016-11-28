// Using this mock data for testing the features of jstree
// var testData = {
//   'core' : {
//     'data' : [
//     {
//       "text" : "Root node",
//       "state" : {"opened" : true },
//       "children" : [
//       {
//         "text" : "Child node 1",
//         "state" : { "selected" : true },
//         "icon" : "glyphicon glyphicon-flash"
//       },
//       { "text" : "Child node 2", "state" : { "disabled" : true } }
//       ]
//     }
//     ]
//   },
//   "plugins" : ["checkbox", "search"]
// };


var ALLOW_MORE_PROPS = true;
var nodeClone = JSON.stringify(tree_data.SubNodes[0])

var pattern = /\??count=/;
var treeNodeCount = 100;
var qsArr = location.search.split('&');
for (var i = 0; i < qsArr.length; i++) {
  if (pattern.test(qsArr[i])) {
    treeNodeCount = Number(qsArr[i].replace(pattern, ''));
    treeNodeCount = treeNodeCount > 1 ? treeNodeCount : 100;
  }
}
for (i = 0; i < treeNodeCount; i++) {
  var newNode = JSON.parse(nodeClone);
  newNode.NodeID.Identifier = 'test' + i;
  tree_data.SubNodes.push(newNode)
}

var converter = function (key, value) {
  if (_.isArray(value)) return value;
  if (_.isNull(value)) return undefined;

  if (value && typeof value === 'object') {
    var replacement = {};
    var new_key = "";
    var new_val = "";
    for (var k in value) {
      if (Object.hasOwnProperty.call(value, k)) {
        new_key = k;
        new_val = value[k];

        if (Object.hasOwnProperty.call(map_keys, k)) {
          new_key = map_keys[k];

          if (k == "NodeClass") {
            if (Object.hasOwnProperty.call(icon_type, new_val)) {
              new_val = icon_type[new_val];
            }
          } else if (k == "NodeID") {
            new_val = JSON.stringify(new_val);
          } else if (k == "BrowseName") {
            new_val = new_val.Name;
          }
        } else if (!ALLOW_MORE_PROPS) break;
        replacement[new_key] = new_val;
      }
    }
    return replacement;
  }
  return value;
}

var map_keys = {
  "NodeID": "id",
  "BrowseName": "text",
  "SubNodes": "children",
  // "NodeClass": "icon"
};
var icon_type = {
  1 : "glyphicon glyphicon-flash",
  2 : "glyphicon glyphicon-ok"
};

var val2 = JSON.stringify(tree_data, converter);

var treeData = {
  'core' : {
    'data' : [
      JSON.parse(val2)
    ]
  },
  "plugins" : ["checkbox", "search"]
}


// Test whether the id field in tree data is unique
var treeDataCore = JSON.parse(val2);
let count = 0;
function traverse(obj, table) {
  if(table[obj.id]) table[obj.id]++;
  else table[obj.id] = 1;

  if (obj.children) {
    obj.children.forEach(function(d) {
      traverse(d, table);
    })
  }
}

var table = {};
traverse(treeDataCore, table);
for(key in table) {
  if(table.hasOwnProperty(key) && table[key] > 1) {
    console.warn('The `id` isn\'t unique');
  }
}

$(function() {
  $('#container').jstree(treeData);
  var listView = $('.list-view');

  var modelDictionary = { }
  $("#container").on("changed.jstree", function (e, data) {
    var treeInstance = $("#container").jstree(true);
    var selectedNodeIdList = data.selected;
    for (var key in modelDictionary) {
      if (selectedNodeIdList.indexOf(key) === -1) {
        modelDictionary[key].remove();
        delete modelDictionary[key];
      }
    }

    selectedNodeIdList.forEach(function(d) {
      if(!modelDictionary[d]) {
        var section = $('<p>' + d+ '</p>');
        $(section).on('click', function() {
            treeInstance.deselect_node(d);
            this.remove();
        });
        modelDictionary[d] = section;
        listView.append(section);
      }
    });
  });
});

$("#s").submit(function(e) {
  e.preventDefault();
  $("#container").jstree(true).search($("#q").val());
});
