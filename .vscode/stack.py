#implementing stack in python (data structure)

def create_stack():
    stack = []
    return stack

#creating an empty stack
def check_empty(stack):
    return len(stack)==0

#adding element in the stack
def push(stack, item):
    stack.append(item)
    print("pushed item" + item)
    #removing elements from stack
    def pop(stack):
        if(check_empty(stack)):
            return "stack is empty"
            return stack.pop()

            #adding items
            stack=create_stack()
            push(stack, str(1))
            push(stack, str(2))
            push(stack, str(3))
            push(stack, str(4))
            push(stack, str(5))
            print("popped item:" + pop(stack))
            print("stack after popped elements:"+ str(stack))
