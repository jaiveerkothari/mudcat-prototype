import json

from pprint import pprint

with open('example.json','r') as f:
	flowchart = json.load(f)

# get all the operator names/keys and put them into a node dictionary

operators = flowchart["operators"]

graph = {}
sensors = []
consumers = []
transformers = []

for operator_key, operator_value in operators.iteritems():
	print type(operator_key)
	if operator_key not in graph:
		# node does not exist in the graph. So add it
		graph[operator_key] = {
			"pred":None,
			"children":set([])
		}
		#graph[operator_key]=set([])

	if operator_value['properties']['operatortype']=='sensor':
		sensors.append(str(operator_key))
	elif operator_value['properties']['operatortype']=='consumer':
		consumers.append(str(operator_key))
	elif operator_value['properties']['operatortype']=='transformer':
		transformers.append(str(operator_key))

links = flowchart["links"]

for link_key, link_value in links.iteritems():
	src = str(link_value["fromOperator"])
	dest = str(link_value["toOperator"])
	# print src,dest
	# not sure if this if condition is required
	if src in graph:
		graph[src]["children"].add(dest)
		graph[dest]["pred"] = src
		# add links?


#printing

for node,node_data in graph.iteritems():
	print "Node: ", node
	print "Data:", node_data

	print "\n"

print "sensors ", sensors
print "consumers", consumers
print "transformers", transformers

# if you store parent pointers to nodes, then just find all the consumers (leafs) and trace it back up to the root
# and that way you get the reverse path


def get_paths(consumer,graph):
	path = []
	path.append(str(consumer))
	current = consumer

	while graph[current]['pred']!=None:
		# while the consumer has a parent
		parent = graph[current]['pred']
		path.append(parent)
		current = parent
	return path

# # now that graph is built, find all the root to leaf paths. aka all the sensor to leaf paths
# for sensor in sensors:
# 	# for each sensor, get the list of paths from sensor to leaf
# 	# paths should be a list of path objects
# 	paths = get_paths(sensor,graph)
# 	all_paths.append(paths)

paths =[]
for consumer in consumers:
	c_to_s = get_paths(consumer,graph)
	paths.append(c_to_s)


print paths


# now we have the paths fromt the nodes, from c to s.

# now get paths from s to c


# for every link that leaves a connector from a sensor, label all those links with the same pin
# a link here is a stream of data
# each connector is a different channel
# when a link enters a T record its input pin and channel. name the ouput pin inputpin2 and all other output links from that T give the same name
# for every consumer, record the input link and what pin it has

# Link object 
# - id - this can be the id from the json file we get from jquery flowchart plugin
# - channel 
# - pin

# Operator object
# - operator type - sensor, consumer or transformer
# - input pin 
# - ouput pin 
# - channel 
# - parent operator
# - child operators
# - in link
# - out link

# working on consolidating the pipelines into one xml pipeline file per sensor






