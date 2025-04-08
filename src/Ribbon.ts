import FormUtils from "./Utils/FormUtils";
import StageChangeActions from "./Utils/StageChangeActions";

// kk.Ribbon.Action.
export class Action {

    // Define all functions that will be called from the Ribbon
    // The functions should be static and should accept the formContext as the first parameter
    public static BtnMoveNext = async (formContext: Xrm.FormContext) => {

        FormUtils.HideAllNotifications(formContext);
        FormUtils.SetIsCustomButton(true);

        // set statuscode, state, set kk_iscustombutton to true
        const resultSave = await FormUtils.OnStageChangeUpdateAndSaveAsync(formContext, XrmEnum.StageChangeDirection.Next);

        if(resultSave){
            formContext.ui.setFormNotification("Form updated to prepare for the next stage", "INFO", "save");
            const resultMoveStage = await StageChangeActions.MoveStageAsync(formContext, StageChangeActions.MoveNextAsync);

            if (resultMoveStage.success){
                formContext.ui.setFormNotification("Form moved to next stage", "INFO", "moveStage");
            }
            else{
                const resultRevert = await FormUtils.OnStageChangeRevertAndSaveAsync(formContext);
                formContext.ui.setFormNotification(`Failed to move to the next stage: ${resultMoveStage.message}`, "ERROR", "moveStage");
                formContext.ui.setFormNotification(`Form reverted to previous stage: ${resultRevert ? "success" : "failed"}`, "INFO", "revert");
            }
        }
        else{
            formContext.ui.setFormNotification("Failed to update form for next stage", "ERROR", "save");
        }
        FormUtils.SetIsCustomButton(false);
    }
    public static BtnMovePrevious = async(formContext: Xrm.FormContext) => {

        FormUtils.HideAllNotifications(formContext);
        FormUtils.SetIsCustomButton(true);

        // set statuscode, state, set kk_iscustombutton to true
        const resultSave = await FormUtils.OnStageChangeUpdateAndSaveAsync(formContext, XrmEnum.StageChangeDirection.Previous);

        if(resultSave){
            formContext.ui.setFormNotification("Form updated to prepare for the previous stage", "INFO", "save");
            const resultMoveStage = await StageChangeActions.MoveStageAsync(formContext, StageChangeActions.MovePreviousAsync);

            if(resultMoveStage.success){
                formContext.ui.setFormNotification("Form moved to previous stage", "INFO", "moveStage");
            }
            else{
                const resultRevert = await FormUtils.OnStageChangeRevertAndSaveAsync(formContext);
                formContext.ui.setFormNotification(`Failed to move to the previous stage: ${resultMoveStage.message}`, "ERROR", "moveStage");
                formContext.ui.setFormNotification(`Form reverted to previous stage: ${resultRevert ? "success" : "failed"}`, "INFO", "revert");
            }
        }
        else{
            formContext.ui.setFormNotification("Failed to update form for previous stage", "ERROR", "save");
        }
        FormUtils.SetIsCustomButton(false);
    }
}