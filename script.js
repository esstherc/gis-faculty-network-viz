// Wait for the DOM to load before creating the network
document.addEventListener("DOMContentLoaded", function() {

    // Fetch nodes and edges from JSON files
    Promise.all([
      fetch('data/nodes.json').then(response => response.json()),
      fetch('data/edges.json').then(response => response.json())
    ]).then(([nodesData, edgesData]) => {
      // Process the nodes to match vis.js expected format
      var nodes = nodesData.map(node => ({
        id: node.id,
        label: node.label,
        value: node.count_value,
        group: node.continent,
        continent: node.continent,
        country: node.country
      }));
  
      // Process the edges
      var edges = edgesData.map(edge => ({
        from: edge.from,
        to: edge.to,
        value: edge.weight  // Use weight for edge thickness or other properties
      }));
  
      // Load the nodes and edges data
      var data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
      };
  
      // Define color schemes for continents and countries
      var continentColors = {
        "North America": "#8DD3C4",
        "Europe": "#FB8072",
        "Asia": "#FDB462",
        "Oceania": "#80B1D3",
        "South America": "#EDC948",
        "Africa": "#BEBADA"
      };

      var countryColors = {
         "United States": "#8CBEB2",
          "China": "#F2EBBF",
          "United Kingdom": "#F3B562",
          "Canada": "#F06060",
          "Germany": "#518318",
          "Netherlands": "#7FACD6",
          "Switzerland": "#BFB8DA",
          "Japan": "#E8B7D4",
          "Sweden": "#A5678E",
          "Australia": "#B8AA9F",
          "South Korea": "#C97878",
          "Israel": "#FFAAA5",
          "New Zealand": "#DCEDC1",
          "Brazil": "#686DC9",
          "France": "#BD7CB5",
          "Luxembourg": "#BDBA8F",
          "Portugal": "#BD5E91",
          "Spain": "#C9AA83",
          "Greece": "#9D55C9",
          "Czech Republic": "#ABB861",
          "Denmark": "#A9ACC9",
          "Austria": "#88B8A9",
          "Finland": "#B88FA7",
          "Norway": "#A3B8B7",
          "Singapore": "#568CB8",
          "Republic of Ireland": "#B8A2A5",
          "Belgium": "#B84DA7",
          "Italy": "#72B887",
          "Malaysia": "#C9C1C1",
          "Poland": "#B89058",
          "Thailand": "#C9B21C",
          "Estonia": "#73C9C6",
          "South Africa": "#9AC971",
          "Russia": "#C9816E",
          "India": "#B855A1",
          "Iran": "#C4C97F",
          "Turkey": "#C9872A"
      }; // We'll populate this dynamically

      var currentGrouping = 'continent'; // Start with continent grouping

      // Create a network graph
      var container = document.getElementById('network');
      var options = {
        nodes: {
          shape: 'dot',
          scaling: {
            min: 10,  // Minimum node size
            max: 50,  // Maximum node size
            label: {
              enabled: true,
              min: 14,  // Minimum font size
              max: 30,  // Maximum font size
              maxVisible: 30,
              drawThreshold: 5
            }
          },
          font: {
            face: 'Oswald',
            size: 16,
            color: '#000000',
          },
          borderWidth: 2,
        },
        edges: {
          color: '#cccccc',
          arrows: 'to'
        },
        groups: {
          "North America": { color: { background: '#8DD3C4', border: '#FFFFFF' }, shape: 'dot' },
          "Europe": { color: { background: '#FB8072', border: '#FFFFFF' }, shape: 'dot' },
          "Asia": { color: { background: '#FDB462', border: '#FFFFFF' }, shape: 'dot' },
          "Oceania": { color: { background: '#80B1D3', border: '#FFFFFF' }, shape: 'dot' },
          "South America": { color: { background: '#EDC948', border: '#FFFFFF' }, shape: 'dot' },
          "Africa": { color: { background: '#BEBADA', border: '#FFFFFF' }, shape: 'dot' }
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -3000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09
          },
          solver: 'barnesHut'
        }
      };
  
      // Initialize the network
      var network = new vis.Network(container, data, options);

      // get pop-up element
      var popup = document.getElementById("node-popup");
      if (!popup) {
        console.error("Popup element not found!");
      }

      // add hover event listener
      network.on("hoverNode", function (params) {
        // get node data
        var node = network.body.nodes[params.node].options;
        
        // pop-up content
        var content = `
          <strong>Institution:</strong> ${node.label}<br>
          <strong>Country:</strong> ${node.country}<br>
          <strong>Continent:</strong> ${node.continent}<br>
          <strong>Faculty Produced:</strong> ${node.value}
        `;
        
        // set up pop-up content and position
        popup.innerHTML = content;

        var domPosition = network.canvasToDOM(params.pointer.canvas);
        popup.style.left = (domPosition.x + 3) + 'px';  // 添加一些偏移
        popup.style.top = (domPosition.y + 3) + 'px';
        popup.style.display = 'block';
      });

      // add mouse leave node event listener
      network.on("blurNode", function (params) {
        if (popup) {
          popup.style.display = 'none';
        }
      });

      // add network graph drag start event listener
      network.on("dragStart", function (params) {
        if (popup) {
          popup.style.display = 'none';
        }
      });

      function updateNodeColors(grouping) {
        var colorScheme = grouping === 'country' ? countryColors : continentColors;
        
        // get all the nodes
        var nodes = network.body.data.nodes;
        
        // update the colors
        nodes.update(nodes.get().map(node => ({
          id: node.id,
          color: {
            background: colorScheme[node[grouping]] || '#CCCCCC', // use gray if no color is defined
            border: '#FFFFFF'
          }
        })));
      
        console.log('Updated colors for:', grouping);
      }

      function createLegend(grouping) {
        var colorScheme = grouping === 'country' ? countryColors : continentColors;
        var legendContainer = document.getElementById('legend');
        legendContainer.innerHTML = ''; // clear the existing legend
        
        for (var key in colorScheme) {
          var legendItem = document.createElement('div');
          legendItem.className = 'legend-item';
          legendItem.innerHTML = `
            <span class="color-box" style="background-color: ${colorScheme[key]};"></span>
            <span class="legend-label">${key}</span>
          `;
          legendContainer.appendChild(legendItem);
        }
      
        console.log('Created legend for:', grouping);
      }

      // Add event listener to the color-switch
      const colorSwitch = document.getElementById('switch');
      
      if (colorSwitch) {
        colorSwitch.addEventListener('change', function() {
          const newGrouping = this.checked ? 'country' : 'continent';
          updateNodeColors(newGrouping);
          createLegend(newGrouping);
        });
      } else {
        console.error('Color switch element not found');
      }

      // Initial legend creation
      createLegend('continent');

      network.setOptions({
        nodes: {
          title: undefined, // disable default tooltip
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
        }
      });

    }).catch(error => console.error('Error loading data:', error));
});

// Keep the CSS styling
document.getElementById('legend').style.maxHeight = '300px';
document.getElementById('legend').style.overflowY = 'auto';

var highlightActive = false;
var originalColors = {};
var connectedNodes = {};

// 获取弹出框元素
var popup = document.getElementById("node-popup");
var popupContent = popup ? popup.querySelector('.callout-content') : null;

network.on("hoverNode", function (params) {
  highlightActive = true;
  var selectedNode = params.node;
  
  // 获取与选中节点直接相连的所有节点
  connectedNodes = network.getConnectedNodes(selectedNode);
  connectedNodes.push(selectedNode); // 包括选中的节点自身
  
  // 存储原始颜色并设置新颜色
  network.body.data.nodes.forEach(function(node) {
    originalColors[node.id] = node.color;
    if (connectedNodes.indexOf(node.id) === -1) {
      // 如果节点不是直接相连的，设置为灰色
      network.body.data.nodes.update({id: node.id, color: {background: '#D3D3D3', border: '#D3D3D3'}});
    }
  });
  
  // 处理边
  network.body.data.edges.forEach(function(edge) {
    originalColors[edge.id] = edge.color;
    if (connectedNodes.indexOf(edge.from) === -1 || connectedNodes.indexOf(edge.to) === -1) {
      // 如果边的两端有任一个不在直接相连的节点中，设置为灰色
      network.body.data.edges.update({id: edge.id, color: {color: '#D3D3D3', highlight: '#D3D3D3'}});
    }
  });

  // 更新网络图
  network.redraw();

  // 弹出信息框逻辑
  if (popup && popupContent) {
    var node = network.body.nodes[selectedNode].options;
    
    var content = `
      <strong>${node.label}</strong><br>
      ${node.country}<br>
      ${node.continent}
    `;
    
    popupContent.innerHTML = content;

    var nodePosition = network.getPositions([selectedNode])[selectedNode];
    var domPosition = network.canvasToDOM(nodePosition);

    popup.style.left = (domPosition.x - popup.offsetWidth / 2) + 'px';
    popup.style.top = (domPosition.y - popup.offsetHeight - 15) + 'px';
    popup.style.display = 'block';
  }
});

network.on("blurNode", function (params) {
  if (highlightActive) {
    // 恢复节点颜色
    network.body.data.nodes.forEach(function(node) {
      if (originalColors[node.id]) {
        network.body.data.nodes.update({id: node.id, color: originalColors[node.id]});
      }
    });
    
    // 恢复边的颜色
    network.body.data.edges.forEach(function(edge) {
      if (originalColors[edge.id]) {
        network.body.data.edges.update({id: edge.id, color: originalColors[edge.id]});
      }
    });
    
    highlightActive = false;
    network.redraw();
  }
  
  // 隐藏弹出框
  if (popup) {
    popup.style.display = 'none';
  }
});

// 在网络图初始化后保存原始颜色
network.on("afterDrawing", function (ctx) {
  if (Object.keys(originalColors).length === 0) {
    network.body.data.nodes.forEach(function(node) {
      originalColors[node.id] = node.color;
    });
    network.body.data.edges.forEach(function(edge) {
      originalColors[edge.id] = edge.color;
    });
  }
});

// 添加网络图拖动开始事件监听器
network.on("dragStart", function () {
  if (popup) {
    popup.style.display = 'none';
  }
});