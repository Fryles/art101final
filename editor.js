// Utility javascript for editing nodes
// Group 2 - ART101 - Fall 2023
// 11/24/2023

// Global declarations

var spawnMode = false;
var mouseX, mouseY;
var selectedNode = null;
var nodes = [];
var nodeCount = 0;
const nodeIdBase = "seagullNode";
// Functions
function Node(
	name,
	desc,
	posx = 0,
	posy = 0,
	size = 24,
	floatX = 0,
	floatY = 0
) {
	this.id = nodeIdBase + nodeCount++; //id of the node
	this.name = name; //name of the node
	this.desc = desc; //description of the node
	this.posx = posx; //x position of the node
	this.posy = posy; //y position of the node
	this.size = size; //size of the node (width and height)
	this.floatX = floatX; //x offset of the floating info box
	this.floatY = floatY; //y offset of the floating info box
	this.floatCss = {
		left: `${this.floatX}px`,
		top: `${this.floatY}px`,
	};
	this.css = {
		left: `${this.posx}px`,
		top: `${this.posy}px`,
		width: `${this.size}px`,
		height: `${this.size}px`,
	};
	this.element = $(`<div id="${this.id}" class="seagullNode">
	<div class="seagullNodeInfo">
	<div class="seagullNodeName">${this.name}</div>
	<div class="seagullNodeDesc">${this.desc}</div>
	</div>
	</div>	`);
	this.element.css(this.css);
	this.element.find(".seagullNodeInfo").css(this.floatCss);
	``;
	this.update = function () {
		this.floatCss = {
			left: `${this.floatX}px`,
			top: `${this.floatY}px`,
		};
		this.css = {
			left: `${this.posx}px`,
			top: `${this.posy}px`,
			width: `${this.size}px`,
			height: `${this.size}px`,
		};
		this.element.css(this.css);
		this.element.find(".seagullNodeInfo").css(this.floatCss);
	};
	this.spawn = function () {
		$("#seagullContainer").append(this.element);
	};
}

/**
 * Prompts to download a file with given params
 * @param {string} text
 * @param {string} name
 * @param {test} type
 * @author https://stackoverflow.com/questions/13405129/create-and-save-a-file-with-javascript
 * @returns {null}
 */
function download(data, filename, type) {
	var file = new Blob([data], { type: type });
	if (window.navigator.msSaveOrOpenBlob)
		// IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else {
		// Others
		var a = document.createElement("a"),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

function spawnEditableNode() {
	var n = new Node("Node", "Description", mouseX - 16, mouseY - 16, 24, 0, 0);
	n.spawn();
	nodes.push(n);
	n.element.removeClass("seagullNode");
	n.element.addClass("seagullNodeEditable");
	$(".selected").removeClass("selected");
	n.element.addClass("selected");
	selectedNode = n;
	//set opacity
	n.element.find(".seagullNodeInfo").css("opacity", 1);
	//set draggable
	n.element.draggable({
		drag: function (event, ui) {
			n.posx = ui.position.left;
			n.posy = ui.position.top;
			n.update();
		},
		distance: 5,
	});
	n.element.on("click", function () {
		if ($(this).hasClass("selected")) {
			return;
		}
		$(".selected").trigger("blur");
		$(".selected").removeClass("selected");
		n.element.addClass("selected");
		selectedNode = n;
		console.log("selected: ");
		console.log(selectedNode);
	});
	//set double click to edit
	n.element.on("dblclick", function () {
		//TODO make dbl click focus on target
		n.element.draggable("disable");
		//set contenteditable
		n.element.find(".seagullNodeName").attr("contenteditable", true);
		n.element.find(".seagullNodeDesc").attr("contenteditable", true);
		n.element.find(".seagullNodeName").focus();
	});
	//set blur to save
	n.element.on("blur", function () {
		//set contenteditable
		n.element.find(".seagullNodeName").attr("contenteditable", false);
		n.element.find(".seagullNodeDesc").attr("contenteditable", false);
		//update node
		n.name = n.element.find(".seagullNodeName").text();
		n.desc = n.element.find(".seagullNodeDesc").text();
		n.element.draggable("enable");
	});
	return n;
}

/**
 * Toggles spawn mode on and off, when toggled back off, prompts to save the json output for all nodes
 * @returns {null}
 */
function spawnModeToggle() {
	spawnMode = !spawnMode;
	if (spawnMode) {
		//attach event listener to the container
		$(document).on("mousemove", function (event) {
			mouseX = event.pageX;
			mouseY = event.pageY;
		});
		// add key listeners to everything but editable nodes
		$(document).on("keyup", function (event) {
			if (event.target.isContentEditable) {
				return;
			}
			// ON DELETE
			if (event.keyCode == 46) {
				var selectedNode = nodes.find((n) => n.id == $(".selected").attr("id"));
				if (!selectedNode) {
					return;
				}
				selectedNode.element.remove();
				nodes = nodes.filter((n) => n.id != selectedNode.id);
				selectedNode = null;
			}
			// ON PRESS TILDA
			if (event.keyCode == 192) {
				spawnEditableNode();
			}
			//ON ARROW KEY PRESS
			if (
				event.keyCode == 38 ||
				event.keyCode == 37 ||
				event.keyCode == 40 ||
				event.keyCode == 39
			) {
				var selectedNode = nodes.find((n) => n.id == $(".selected").attr("id"));
				if (!selectedNode) {
					return;
				}
				const fl = 10;
				if (event.keyCode == 38) {
					selectedNode.floatY -= fl;
				} else if (event.keyCode == 37) {
					selectedNode.floatX -= fl;
				} else if (event.keyCode == 40) {
					selectedNode.floatY += fl;
				} else if (event.keyCode == 39) {
					selectedNode.floatX += fl;
				}
				selectedNode.update();
			}
		});
		$("#seagullContainer").on("click", function (event) {
			if (event.target == $(this)[0]) {
				$(".selected").removeClass("selected");
				selectedNode = null;
				$("#seagullContainer").children().trigger("blur");
				console.log("deselecting");
			}
		});
		$("#seagullContainer").on("dblclick", function (event) {
			if (event.target == $(this)[0]) {
				spawnEditableNode();
			}
		});

		console.log("Spawn mode on");
	} else {
		//detach event listeners
		$(document).off("mousemove");
		$(document).off("keyup");
		//collect all nodes
		for (var i = 0; i < nodes.length; i++) {
			delete nodes[i].element;
			delete nodes[i].update;
			delete nodes[i].spawn;
		}
		download(JSON.stringify(nodes), "nodes.json", "application/json");
		console.log("Spawn mode off");
	}
}