## Check if there's abnormalities found

1. Through build

- initial build simple pointing out that theres problem with data in json. it's caused by inproper character escaping. `\\\\ud83e\\\\udd29\\\\ud83e\\\\udd70\\\\ud83d\\\\udc4d`
- this is directly fixed through the change of the data itself ie modifying the `products.json` to change the above string to `🤩🥰👍`

2. Basic screening from return type

- `typeof products` doesn't return any weird union indicating incosistensies in object structure.
- this method is not really practical in real world scenario because we won't be analising data like this and it wont be static data like this.

3. using AI to check.

- file is large. always hitting context probem. nevertheless theres no problem.
- similarly this method is not really practical in real world similar to reason above.
