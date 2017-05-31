$(document).ready(function() {
    var $flowchart = $('#example_9');
    var $container = $flowchart.parent();
    
    var cx = $flowchart.width() / 2;
    var cy = $flowchart.height() / 2;
    
    
    var data = {};
    
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
      console.log(jsondata);

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