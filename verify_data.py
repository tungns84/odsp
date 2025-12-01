import json
try:
    data = json.load(open('data.json', encoding='utf-16'))
    if isinstance(data, list):
        if len(data) > 0:
            row = data[0]
            print(f"Name: {row.get('name')}")
            print(f"Type: {row.get('type')}")
        else:
            print("Empty list returned")
    else:
        print("Error Response:")
        print(f"Status: {data.get('status')}")
        print(f"Error: {data.get('error')}")
        print(f"Message: {data.get('message')}")
except Exception as e:
    print(f"Failed to parse: {e}")
