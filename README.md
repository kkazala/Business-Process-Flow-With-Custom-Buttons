# Business Process Flow With Custom Buttons

**Business Process Flows** in Power Platform guide app users through a sequence of predefined steps, ensuring that all required fields are completed before progressing to the next stage.

The buttons allowing users to move to the next stage are.. well... **well hidden**.

![bpf buttons](./assets/bpfbuttons.png)

Good choice? Bad choice?


![user experience](./assets/uivsux.png)

Perhaps when working with a small group of users, it's manageable to show each person where to find them. But when you're building an app intended for company-wide use, it becomes an obstacle.

## Custom buttons

That's why it's common to add custom buttons to the toolbar (and to declutter it while you're at it).

These custom buttons can be shown or hidden (or enabled/disabled) based on specific conditions, such as whether the user has a certain role, the form is completed, or an approver has made a decision.

You may also use these buttons to trigger additional logic, like updating the "Status Reason" field, showing notifications or even preventing the user from moving to the next stage based on custom conditions.

However, if you take this approach, make sure the default buttons cannot be used to bypass this additional logic.

### Disabling / hiding BPF buttons?

It is of course possible to manipulate the DOM of your model-driven apps, but... it's [not supported](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference). The supported approach is to use the [onPreStageChange](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/events/onprestagechange) event to block stage changes.

This event runs before the stage changes - whether triggered by a user clicking one of the standard Business Process Flow buttons (i.e. **Next Stage**, **Previous Stage**, or **Set Active Stage**), or by programmatic calls such as `formContext.data.process.moveNext`, `formContext.data.process.movePrevious`, or `formContext.data.process.setActiveStage`.

This means that when implementing custom logic, we need to make sure the custom buttons are allowed to perform the stage transition, while blocking all other requests.

## The design

I made a "plan minimum" solution that covers the most important parts of the process. It:
- ensures that only custom buttons can move between stages,
- updates the record's status fields and calls rollback functions if required,
- displays notifications
- finalizes and restarts the process as needed

![custom buttons](./assets/custombuttons.png)

This logic is supported by a client-side script used by the form and the custom buttons:

1. In the form's `OnLoad`, add an event handler for the `onPreStageChange` event.
1. In the `onPreStageChange` event handler, ensure the request came from your custom button. Otherwise call `executionContext.getEventArgs().preventDefault()` to cancel navigation to another stage.
1. In the logic of your custom buttons, set a `isCustomBotton` to `true` to make sure the move to the stage will be allowed. I'm saving this variable to the browser's local cache.
1. Handle any additional logic and move to the next/previous stage. Implement rollback functions in case of errors. Reset the  `isCustomBotton` to `false`.
1. To finish the business process flow, complete the process and set the record as inactive.
1. To restart completed process, re-activate the record and move back to the previous stage.

### Gotcha: the "Finish" action

Unfortunately, neither the `OnPreStageChange` nor the `OnProcessStatusChange` events can stop the **Finish** action in Business Process Flow.

One way to work around this issue is by adding an extra, final stage and immediately completing the flow as soon as that stage is reached.
This stage wouldn’t be actively used by users—it's just there to help finalize the process behind the scenes.

The code supports both scenarios: with and without automatic completion of the last stage. Simply set the `_FINALIZELASTSTAGE` in
[StageChangeActions.ts](https://github.com/kkazala/Business-Process-Flow-With-Custom-Buttons/blob/main/src/Utils/StageChangeActions.ts#L7) to `true` or `false` and rebuild the solution.

