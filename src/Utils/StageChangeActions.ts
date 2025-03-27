type AsyncFunction = (formContext: Xrm.FormContext) => Promise<ResultInfo>;

export type ResultInfo={
    success: boolean;
    message?: string;
}

// The "kk_iscustombutton" field is set to "true" when a custom ribbon button is clicked (FormUtils.UpdateFormOnStageChange)
// It is automatically set to "false" when the move to the next/previous stage is successful, and during rollback (FormUtils.RevertFormOnStageChange)
const fIsCustomButtonName= "kk_iscustombutton";

export default class StageChangeActions {

    private static _moveNextAsync = async (formContext: Xrm.FormContext) => {
        return new Promise((resolve) => {
            formContext.data.process.moveNext((result) => {
                resolve(result);
            });
        });
    }
    private static _movePreviousAsync = async (formContext: Xrm.FormContext) => {
        return new Promise((resolve) => {
            formContext.data.process.movePrevious((result) => {
                resolve(result);
            });
        });
    }
    private static _setProcessStatus = async (formContext: Xrm.FormContext, status: Xrm.ProcessFlow.ProcessStatus) => {
        return new Promise((resolve) => {
            formContext.data.process.setStatus(status, (result) => {
                resolve(result);
            });
        });
    }
    public static IsLastStage= (formContext: Xrm.FormContext): boolean => {
        const curStage = formContext.data.process.getActiveStage().getName();
        const path = formContext.data.process.getActivePath().get().map(s => s.getName());
        return curStage === path[path.length - 1];
    }
    public static IsFirstStage= (formContext: Xrm.FormContext): boolean => {
        const curStage = formContext.data.process.getActiveStage().getName();
        const path = formContext.data.process.getActivePath().get().map(s => s.getName());
        return curStage === path[0];
    }

    //async MoveStage methof
    public static MoveStageAsync = async function (formContext: Xrm.FormContext, stageDelegate: AsyncFunction): Promise<ResultInfo> {
        let success: boolean = false;
        let message: string = "";

        try{
            //should not happen, but just in case
            if (formContext.data.getIsDirty()) {
                await formContext.data.save();
            }
            //call MoveNext / MovePrevious
            return await stageDelegate(formContext);

        }
        catch (error:any) {
            message=error.message;
        }
        return {success,message};
    }

    public static MoveNextAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> =>{

        let success: boolean = false;
        let message: string = "";

        if (StageChangeActions.IsLastStage(formContext) ) {
            if (formContext.data.process.getStatus() === "active"){
                return await StageChangeActions.CompleteProcessAsync(formContext);
            }
            else {
                message = "The process is already finished.";
            }
        }
        else {
            const result = await StageChangeActions._moveNextAsync(formContext);
            switch (result) {
                case "stageGate":
                    message="One or more required columns on the current stage are empty. Cannot proceed.";
                    break;
                case "success":
                    //reset the isCustomButton field to false and save
                    formContext.getAttribute(fIsCustomButtonName).setValue(false);
                    await formContext.data.save();
                    success = true;
                    break;
                default:
                    //https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data-process/navigation/movenext
                    //invalid, dirtyForm, crossEntity,end
                    message = `Error: Unable to move to the previous stage: ${result}`;
                    break;
            }
        }

        return {success,message};
    }

    public static MovePreviousAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> => {
        let success: boolean = false;
        let message: string = "";

        if(StageChangeActions.IsFirstStage(formContext)){
            message="The active stage is the first stage of the active path.";
        }
        else if (StageChangeActions.IsLastStage(formContext) && formContext.data.process.getStatus() === "finished" ){
            return StageChangeActions.RestartProcessAsync(formContext);
        }
        else {
            const result= await StageChangeActions._movePreviousAsync(formContext);
            switch (result) {
                case "stageGate":
                    message="One or more required columns on the current stage are empty. Cannot proceed.";
                    break;
                case "beginning":
                    message="The active stage is the first stage of the active path.";
                    break;
                case "success":
                    //reset the isCustomButton field to false and save
                    formContext.getAttribute(fIsCustomButtonName).setValue(false);
                    await formContext.data.save();
                    success = true;
                    break;
                default:
                    //https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data-process/navigation/moveprevious
                    //invalid, dirtyForm, crossEntity, preventDefault
                    message = `Error: Unable to move to the previous stage: ${result}`;
                    break;
            }
        }
        return {success,message};
    }

    public static CompleteProcessAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> => {

        let success: boolean = false;
        let message: string = "";

        if (formContext.data.process.getStatus() === "active") {

            const result = await StageChangeActions._setProcessStatus(formContext, "finished");
            if (result === "finished") {
                formContext.getAttribute(fIsCustomButtonName).setValue(false);
                await formContext.data.save();
                success = true;
            }
            else {
                message = "Error: Unable to complete the process.";
            }
        }
        return {success, message};
    };

    public static RestartProcessAsync = async (formContext: Xrm.FormContext): Promise<ResultInfo> =>{
        let success: boolean = false;
        let message: string = "";

        const result = await StageChangeActions._setProcessStatus(formContext, "active");
        if (result === "active") {
            formContext.getAttribute(fIsCustomButtonName).setValue(false);
            await formContext.data.save();
            success = true;
        }
        else {
            message = "Error: Unable to restart the process.";
        }

        return {success, message};
    }

}