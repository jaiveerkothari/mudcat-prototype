$(document).ready(function() {
    var $flowchart = $('#example_9');
    var $container = $flowchart.parent();
    
    var cx = $flowchart.width() / 2;
    var cy = $flowchart.height() / 2;
    
    
    var data = {};



    ////////
    //////// THIS IS WHERE THE GRAPHER CODE WILL BE RE_WRITTEN
    function grapher(jdata){
      console.log("grapher has been called");
      console.log(jdata);
      var flowchart = jdata; //here flowchart is a json object

      var register_tags= rt;
      var sensor_tags= st;

      

      class Node {
        constructor(uid){
          this.uid = uid;
          this.component_type = null;
          this.pin_in = null;
          this.pin_out = null;
          this.channels = new Set();
          this.parent = null;
          this.children = new Set();
          this.link_in = null;
          this.links_out = new Set();
          this.title=null;
        }
      };
      class Link {
        constructor(uid){
          this.uid = uid
          this.channel = null;
          this.pin = null;
          this.source = null;
          this.destination = null;
        }
      };

      var operators = flowchart["operators"];
      console.log("operators is...");
      console.log(operators);

      var links = flowchart["links"];

      var graph_nodes = {};
      var graph_links = {};

      var sensors = [];
      var consumers = [];
      var transformers = [];

      for(var operator_key in operators){
        //console.log(operator_key,operators[operator_key]);
        if(!(operator_key in graph_nodes)){
          var new_node = new Node(operator_key);
          new_node.component_type = operators[operator_key]["properties"]["operatortype"];
          new_node.title = operators[operator_key]["properties"]["title"];

          if(operators[operator_key]["properties"]["operatortype"] == "sensor"){
            new_node.channels = new Set();
            for(var channel_name in operators[operator_key]["properties"]["outputs"]){
              new_node.channels.add(channel_name);
            }
          }
          graph_nodes[operator_key] = new_node;

          //// do the if and 2 elifs her
        }
        /////
        if(operators[operator_key]["properties"]["operatortype"] == "sensor"){
          sensors.push(operator_key);
        }
        else if(operators[operator_key]["properties"]["operatortype"] == "consumer"){
          consumers.push(operator_key);
        }
        else if(operators[operator_key]["properties"]["operatortype"] == "transformer"){
          transformers.push(operator_key);

        }
      }

      

      for(var link_key in links){
        var new_link = new Link(link_key);
        var source_node_id = links[link_key]["fromOperator"];
        var destination_node_id = links[link_key]["toOperator"];
        new_link.source = source_node_id;
        new_link.destination = destination_node_id;

        if(graph_nodes[source_node_id].component_type=="sensor"){
          new_link.channel = links[link_key]["fromConnector"];

        }
        graph_links[link_key] = new_link;

        if(source_node_id in graph_nodes){
          graph_nodes[source_node_id].children.add(destination_node_id);
          graph_nodes[destination_node_id].parent = source_node_id;

          graph_nodes[source_node_id].links_out.add(link_key);
          graph_nodes[destination_node_id].link_in = link_key;
        }

      }
      //aite the json works
      console.log("GRAPH NODES ARE:");
      console.log(graph_nodes);

      console.log("GRAPH LINKS ARE:");
      console.log(graph_links);

      function tree_walk(sid,gn,gl,links,ops){
        var l_out_ids = gn[sid].links_out;
        for(let link_id of l_out_ids){
          gl[link_id].pin = gl[link_id].channel + "01";
        }

        var q = [];
        q.push(sid);

        while(q.length > 0){
          var nid = q.pop();

          if(gn[nid].component_type!="sensor"){
            var pid = gn[nid].parent;

            if(gn[pid].component_type=="sensor"){
              gn[nid].pin_in = gl[gn[nid].link_in].pin;
            }
            else{
              gn[nid].pin_in = gn[pid].pin_out;
            }

            if(gn[nid].component_type=="transformer"){
              gn[nid].pin_out = gn[nid].pin_in + "t" + nid;
            }

          }
          for(let child_id of gn[nid].children){
            q.push(child_id);
          }
        }

      }

      for(var sensor_id in sensors){
        tree_walk(sensor_id, graph_nodes, graph_links, links, operators);
        console.log("did tree walk on ");
        console.log(sensor_id);

      }
      console.log("GRAPH NODES POST TREE WALK:");
      console.log(graph_nodes);

      console.log("GRAPH LINKS POST TREE WALK:");
      console.log(graph_links);

      function get_tag(nid,gn){
        var tagarr = [];
        if(gn[nid].component_type =="sensor"){
          tagarr.push("<register>");
          console.log(register_tags[gn[nid].title]);
          for(var tagidx=0; tagidx < register_tags[gn[nid].title].length; tagidx++){
            tagarr.push(register_tags[gn[nid].title][tagidx]);
          }
          tagarr.push("</register>");
        }
        else if(gn[nid].component_type=="transformer"){
          tagarr.push("<transformer>");
          tagarr.push("<input pin=\""+ gn[nid].pin_in +"\">");
          tagarr.push("<ouput pin=\""+ gn[nid].pin_out +"\">");
          tagarr.push("</transformer>");
        }
        else if(gn[nid].component_type=="consumer"){
          tagarr.push("<consumer>");
          tagarr.push("<input pin=\""+ gn[nid].pin_in +"\">");
          tagarr.push("</consumer>");
        }
        return tagarr;

      }
      function create_xml(sid,gn,gl,links,ops){
        var l_out_ids = gn[sid].links_out;
        var q = [];
        q.push(sid);

        while(q.length > 0){
          var nid = q.pop();
          var tag = get_tag(nid,gn);
          console.log("TAG for operator "+nid);
          for(var i = 0; i < tag.length; i++){
            //console.log("LOGGING A LINE");
            console.log(tag[i]);
          }
          console.log("\n");

          for(let child_id of gn[nid].children){
            q.push(child_id);
          }
        }


      }
      for(var sensor_id in sensors){
        create_xml(sensor_id, graph_nodes, graph_links, links, operators);
        console.log("called create xml on sensor "+sensor_id);
      }
      console.log("XML DUMPS ^");



    };


    ////////

    
    // Apply the plugin on a standard, empty div...
    $flowchart.flowchart({
      data: data,
      multipleLinksOnOutput: true
    });
    $flowchart.parent().siblings('.delete_selected_button').click(function() {
      $flowchart.flowchart('deleteSelected');
    });
    
    $flowchart.parent().siblings('.get_data').click(function() {
      console.log("get data clicked");
      var data = $flowchart.flowchart('getData');
      var jsondata = JSON.stringify(data, null, 2);
      //console.log(jsondata);

      grapher(data);
      // $.ajax({
      //   type: "POST",
      //   url: "~/grapher2.py",
      //   data: { param: jsondata}
      // }).done(function( o ) {
      //    // do something
      // });


      // here send this jsondata to the function that parses it and creates the xml

      $('#flowchart_data').val(JSON.stringify(data, null, 2));

      var x = window.open();
      x.document.open();
      x.document.write('<html><body><pre>' + jsondata + '</pre></body></html>');
      x.document.close();



    });


    var $draggableOperators = $('.draggable_operator');
    
    function getOperatorData($element) {
      var nbInputs = parseInt($element.data('nb-inputs'));
      var nbOutputs = parseInt($element.data('nb-outputs'));
      var element_name = ($element.data('name'));
      var data = {
        properties: {
          title: $element.text(),
          operatortype: "sensor",
          inputs: {},
          outputs: {}
        } 
      };

      if(element_name=="ms_kinect_2"){

        data.properties.operatortype="sensor";

        data.properties.outputs['skeleton']= {
          label: 'Skeleton'
        };
        data.properties.outputs['au']= {
          label: 'A U'
        };
        data.properties.outputs['audio']= {
          label: 'Audio'
        };
        data.properties.outputs['rgb']= {
          label: 'RGB'
        };
        data.properties.outputs['depth']= {
          label: 'Depth'
        };

      }
      else if(element_name=="eyetribe"){
        data.properties.operatortype="sensor";

        data.properties.outputs['gaze']= {
          label: 'Raw Gaze'
        };

      }
      else if(element_name=="360_camera"){
        data.properties.operatortype="sensor";

        data.properties.outputs['video']= {
          label: '360 Camera'
        };

      }
      else if(element_name=="transformer_1"){

        data.properties.operatortype="transformer";

        data.properties.inputs['input']= {
          label: 'Input 1'
        };
        data.properties.outputs['output']= {
          label: 'Output 1'
        };

      }
      else if(element_name=="write_csv"){

        data.properties.operatortype="consumer";

        data.properties.inputs['data']= {
          label: 'Input 1'
        };

      }
      else if(element_name=="write_txt"){

        data.properties.operatortype="consumer";

        data.properties.inputs['data']= {
          label: 'Input 1'
        };

      }
      else if(element_name=="write_wav"){

        data.properties.operatortype="consumer";
        
        data.properties.inputs['data']= {
          label: 'Input 1'
        };

      }
      
      
      return data;
    }
    
    var operatorId = 0;
    var operatorCount = 0;
        
    $draggableOperators.draggable({
        cursor: "move",
        opacity: 0.7,
        
        helper: 'clone', 
        appendTo: 'body',
        zIndex: 1000,
        
        helper: function(e) {
          var $this = $(this);
          var data = getOperatorData($this);
          return $flowchart.flowchart('getOperatorElement', data);
        },
        stop: function(e, ui) {
            var $this = $(this);
            var elOffset = ui.offset;
            var containerOffset = $container.offset();
            if (elOffset.left > containerOffset.left &&
                elOffset.top > containerOffset.top && 
                elOffset.left < containerOffset.left + $container.width() &&
                elOffset.top < containerOffset.top + $container.height()) {
                var flowchartOffset = $flowchart.offset();
                var relativeLeft = elOffset.left - flowchartOffset.left;
                var relativeTop = elOffset.top - flowchartOffset.top;
                var positionRatio = $flowchart.flowchart('getPositionRatio');
                relativeLeft /= positionRatio;
                relativeTop /= positionRatio;
                
                var data = getOperatorData($this);
                data.left = relativeLeft;
                data.top = relativeTop;
                
                $flowchart.flowchart('addOperator', data);
            }
        }
    });
    
    
});