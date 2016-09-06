var ALLOW_MORE_PROPS = true;

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

// Using this mock data for testing the features of jstree
// var testData = {
// 	'core' : {
// 		'data' : [
// 		{
// 			"text" : "Root node",
// 			"state" : {"opened" : true },
// 			"children" : [
// 			{
// 				"text" : "Child node 1",
// 				"state" : { "selected" : true },
// 				"icon" : "glyphicon glyphicon-flash"
// 			},
// 			{ "text" : "Child node 2", "state" : { "disabled" : true } }
// 			]
// 		}
// 		]
// 	},
// 	"plugins" : ["checkbox", "search"]
// };

// Test whether the id field in tree data is unique
var treeDataCore = JSON.parse(val2);
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
console.log(table);
for(key in table) {
	if(table.hasOwnProperty(key) && table[key] > 1) {
		console.warn('The `id` isn\'t unique');
		break;
	}
}



$(function() {
	$('#container').jstree(treeData);
});


$("#s").submit(function(e) {
  e.preventDefault();
  $("#container").jstree().search($("#q").val());
});
