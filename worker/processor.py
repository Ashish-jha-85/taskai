def process_task(operation, text):

    if operation == "uppercase":
        return text.upper()

    elif operation == "lowercase":
        return text.lower()

    elif operation == "reverse":
        return text[::-1]

    elif operation == "wordcount":
        return len(text.split())

    else:
        raise Exception("Invalid operation")
