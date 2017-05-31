class Node:
	# count = 0
	# use this as the id?
	def __init__(self,uid):
		self.uid = uid
		self.component_type = None
		self.pin_in=None
		self.pin_out=None
		self.channels=None
		self.parent=None
		self.children=[]
		self.links_in=[]
		self.links_out=[]


class Link:

	def __init__(self, uid):
		self.uid = uid
		self.channel = None
		self.pin = None
		self.source = None
		self.destination = None
		



