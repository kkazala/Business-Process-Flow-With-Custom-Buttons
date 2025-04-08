# Business Process Flow With Custom Buttons

The Business Process Flow in Power Platform guides users through a sequence of predefined steps, ensuring that all required fields are filled in before the user can move to the next stage.
This mechanism may also be used to add additional "gates" blocking user from progressing to the next stage and for more complex business logic we can use a hidden field that is updated using Business Rules or JavaScript.

The buttons allowing users to move to the next stage are.. well... well hidden.

![bpf buttons](./assets/bpfbuttons.png)

Good choice? Bad choice?
Perhaps when working with a small group of users, it is feasible to explain each of them on how to find the buttons.
When building application that may be potentially used by the whole company, it becomes an obstacle.

![](./assets/uivsux.png)

This is why adding custom buttons to the toolbar (and cleaning the clutter in the toolbar)