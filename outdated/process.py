# process the json from the flowchart and give a represnetation of what the pipeline is like

# v1: ASSUMPTIONS: no decorators or visualizers at the moment
# no transformers?


# flowchart is represented as a dictionary
# at the top level you have keys for operators, links and operatorType


import json

from pprint import pprint

with open('example.json','r') as f:
	flowchart = json.load(f)

#pprint(flowchart)

data = {}
data = {
	"sensors":[],
	"channels":[],
	"transformers":[],
	"consumers":[]
}
links2=[]

operators = flowchart['operators']
links = flowchart["links"]

# get the number of operators

num_operators = len(operators)

# print operators.keys()
# print len(operators)

#print operators["0"]['properties']['operatortype']

for operator, operator_data in operators.iteritems():
	#print operator
	if operator_data['properties']['operatortype']=="sensor":
		data['sensors'].append(operator)
	elif operator_data['properties']['operatortype']=="consumer":
		data['consumers'].append(operator)
	elif operator_data['properties']['operatortype']=="transformer":
		data['transformers'].append(operator)      

def getOperatorName(fchart,id):
	operators=fchart["operators"]
	name = operators[str(id)]['properties']['title']
	return name



#print data

# now to get all the channels. go to all the operators and get the outgoing links

for link, link_data in links.iteritems():
	this_link = {
		"to":getOperatorName(flowchart,link_data["toOperator"]),
		"from":getOperatorName(flowchart,link_data["fromOperator"]),
		"channel":link_data["fromConnector"]
	}
	links2.append(this_link)

print links2





