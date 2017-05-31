import json
from pprint import pprint

with open('example.json','r') as f:
	flowchart = json.load(f)

with open('register.json','r') as f:
	register_tags= json.load(f)

with open('sensor.json','r') as f:
	sensor_tags = json.load(f)

###############################################
# define the Node and Link classes here 

class Node:
	# count = 0
	# use this as the id?
	def __init__(self,uid):
		self.uid = uid
		self.component_type = None # sensor, transformer, consumer
		self.pin_in=None
		self.pin_out=None
		self.channels=set([])
		self.parent=None
		self.children=set([])
		self.link_in=None  # can only have one link in
		self.links_out=set([]) # can have multiple links out
		self.title=None



class Link:

	def __init__(self, uid):
		self.uid = uid
		self.channel = None
		self.pin = None
		self.source = None
		self.destination = None


################################################

# store all the nodes in a dictionary where key is node id and the value is the node
# store all links in a dictionary where key is the link id and the value is the link

operators = flowchart["operators"]
links = flowchart["links"]

graph_nodes = {}
graph_links = {}

sensors = []
consumers = []
transformers = []

for operator_key, operator_value in operators.iteritems():
	if str(operator_key) not in graph_nodes:
		# check is operator key a string or unicode
		# the operato key is in unicode. lets cast this to string

		# node does not exist in the graph. So add it
		# this creates a Node object with a string id the same as the id it got from the json file
		new_node = Node(str(operator_key))
		new_node.component_type = operator_value['properties']['operatortype']
		new_node.title = operator_value['properties']['title']

		if operator_value['properties']['operatortype']=='sensor':
			# if this node is a sensor, create the list of channels coming out from this node
			new_node.channels=set([])
			for channel_name,_ in operator_value['properties']['outputs'].iteritems():
				new_node.channels.add(str(channel_name))

		# now add this new_node to the graph_nodes dictionary
		graph_nodes[str(operator_key)] = new_node

	# creating lists of sensors, ts and cs for easy access later
	# these will be lists of string ids of the operators/nodes
	# eg. sensors = ['0','2']

	if operator_value['properties']['operatortype']=='sensor':
		sensors.append(str(operator_key))
	elif operator_value['properties']['operatortype']=='consumer':
		consumers.append(str(operator_key))
	elif operator_value['properties']['operatortype']=='transformer':
		transformers.append(str(operator_key))

for link_key, link_value in links.iteritems():
	# link_key is unicode
	new_link = Link(str(link_key))
	# contiue after this
	source_node_id = str(link_value["fromOperator"]) #str uid of the src node
	destination_node_id = str(link_value["toOperator"])

	new_link.source = source_node_id
	new_link.destination = destination_node_id

	if graph_nodes[source_node_id].component_type=="sensor":
		new_link.channel = str(link_value["fromConnector"])

	graph_links[str(link_key)] = new_link

	# print src,dest
	# not sure if this if condition is required
	if source_node_id in graph_nodes:
		graph_nodes[source_node_id].children.add(destination_node_id)
		graph_nodes[destination_node_id].parent = source_node_id

		graph_nodes[source_node_id].links_out.add(str(link_key))
		graph_nodes[destination_node_id].link_in = str(link_key)

		# add links?
	



print "Graph Nodes are \n",graph_nodes

print "Graph Links are \n",graph_links

def print_nodes():
	for node_id, node in graph_nodes.iteritems():
		print "Graph Node ID:", node_id
		print "Node Title ", node.title
		print "Node Children ", node.children
		print "Node Parent ", node.parent
		print "Node Pin in", node.pin_in
		print "Node Pin out", node.pin_out
		print "Node Link in", node.link_in
		print "Node Links out", node.links_out
		print "\n"




# iterate through the list of sensors and then send each sensor id to the tree walk function
# in the tree walk function we want to go from sensor down, updating all the pins and the channels for every successive node

def tree_walk(sid,gn,gl,links,ops):
	#sid is the id of the sensor, which will be treated as the root of the tree

	# this will be in the form of a BFS

	# special treatment for the sensor node/root node. for each output link, assign it a channel and a pin
	# to do that, count all the op links and make a set of channels/connectors
	# then for each connector, for all the links going out of that connector, give them the same channel and pin
	# then move onto the next connector

	# get out links from this node
	l_out_ids = gn[sid].links_out
	# this is a set of lout ids

	for link_id in l_out_ids:
		gl[link_id].pin = gl[link_id].channel + "01"

	# print out all the links and see what their pins are to check?

	# now start the bfs

	# if a node is a transformer or Consumer, you can check what the parent's pin out is or you can check the incoming
	# link's pin to set that nodes pin in
	# if t then create a new pin out
	# if c then no pin out and you are done

	q = []
	q.append(sid)

	while len(q)>0:
		nid = q.pop()

		if gn[nid].component_type!="sensor":
			pid = gn[nid].parent
			# setting pin_in
			if gn[pid].component_type=="sensor":
				gn[nid].pin_in = gl[gn[nid].link_in].pin 
			else:
				# if parent is transformer
				gn[nid].pin_in = gn[pid].pin_out

			# setting pin_out
			if gn[nid].component_type=="transformer":
				# if consumer then no pin out
				gn[nid].pin_out = gn[nid].pin_in + "t"+str(nid)

		for child_id in gn[nid].children:
			q.append(child_id)






for sensor_id in sensors:
	tree_walk(sensor_id,graph_nodes,graph_links,links,operators)

print_nodes()


# above, we are parsing through the links and storing Link objects into a dict
# created the tree with parent and child relationships

# now do a BFS through the tree where you update the information about all the Nodes in the tree, like pin_in and pin_out

# after that, find the c to s paths
# and then get the s to c paths
# group the paths by sensor
# then for each node in those paths, generate an XML blck
# and then print those out into a sensor specific file


# now for each node in the tree, create its xml blob
# start with sensor

# get the register tag from the xml
# then get the sensor tag. for now hard code in the tag attributes
# for the output channels get them from the json
# for each output tag, need channel and pin
# get the channel from the front end json or from the back end json. This is given to you and set
# for the pin, get the pin from the sensor node
# if the pins have not been declared then give each pin the same name as the channel plus the sensor id

def get_tag(nid,gn):
	tagarr=[]
	if gn[nid].component_type =="sensor":
		tagarr.append("<register>")
		for tagline in register_tags[gn[nid].title]:
			tagarr.append(tagline)
		tagarr.append("</register>")
		
	elif gn[nid].component_type=="transformer":
		tagarr.append("<transformer>")
		tagarr.append("<input pin=\""+ gn[nid].pin_in +"\">")
		tagarr.append("<ouput pin=\""+ gn[nid].pin_out +"\">")
		tagarr.append("</transformer>")
		
	elif gn[nid].component_type=="consumer":
		tagarr.append("<consumer>")
		tagarr.append("<input pin=\""+ gn[nid].pin_in +"\">")
		tagarr.append("</consumer>")
	return tagarr
	

def create_xml(sid,gn,gl,links,ops):
	l_out_ids = gn[sid].links_out

	q = []
	q.append(sid)

	while len(q)>0:
		nid = q.pop()
		tag = get_tag(nid,gn)
		for line in tag:
			print line
		print "\n"

		for child_id in gn[nid].children:
			q.append(child_id)
	


for sensor_id in sensors:
	create_xml(sensor_id,graph_nodes,graph_links,links,operators)







