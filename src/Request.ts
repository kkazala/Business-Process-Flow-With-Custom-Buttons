import FormUtils from "./Utils/FormUtils";

const currentVersion = "0.0.1.0";

// Usage Example: kk.Request.Form.OnLoad;, replace 'kk' with your own namespace
export class Form {

    private static ensureCustomButton = function (executionContext: Xrm.Events.EventContext) {

        //custom buttons set the flag to true, so the stage change is allowed
        const formContext = executionContext.getFormContext() as Xrm.Kk_table1;

        FormUtils.HideAllNotifications(formContext);

        // if the event is triggered by the custom buttons, ok
        // otherwise cancel the stage change
        // if (formContext.getAttribute("kk_iscustombutton").getValue() !== true) {
        if(FormUtils.GetIsCustomButton() !== true){
            //prevent stage change
            (executionContext as Xrm.Events.StageChangeEventContext).getEventArgs().preventDefault();

            formContext.ui.setFormNotification(
                "Please use the buttons in the toolbar in order to move to another stage of the review process.",
                "INFO", "movestagecancelled"
            );
        }
        //the value of the flag is reset to false AFTER the stage change
    }

    public static OnLoad(executionContext: Xrm.Events.EventContext, versionNumber: string) {

        const formContext = executionContext.getFormContext();

        // Check if the form version loaded in the user's browser is outdated
        if (currentVersion !== versionNumber) {
            formContext.ui.setFormNotification(
                "The form is outdated. Please refresh the page using Ctrl+F5 buttons.",
                "WARNING", "versionMismatch"
            );
        }

        // This event occurs Before the stage of a business process flow control changes.
        // This event occurs after the user selects the Next Stage, Move to previous stage or Set Active Stage buttons in the user interface
        // or when a developer uses the formContext.data.process.moveNext, formContext.data.process.movePrevious,
        // or formContext.data.process.setActiveStage methods.
        formContext.data.process.addOnPreStageChange(Form.ensureCustomButton);
    }
}