interface String {
    hashValue(): number;
}

interface Element {
    edpEmpty(message: any): Element;
	edpAppend(message: any): Element;
	edpFind(message: string): NodeListOf<any>;
}

interface DocumentFragment {
	edpAppend(message: any): DocumentFragment;
}

interface NodeList {
	edpAppend(message: any): NodeList;
}

interface Node {
	edpAppend(message: any): Node;
}