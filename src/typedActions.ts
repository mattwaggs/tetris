export interface Action { type?: string }
export interface HasType { type: string }

export const ActionCreator = <A extends Action>(type: string) => (payload: any): HasType => {
	return { ...payload, type: type};
}

export const typedToPlain = (store: any) => (next: any) => (action: any) => {
    if (!action.type) {
        action.type = "__UNKNOWN_ACTION_TYPE"
    }

    next({ ...action});
};
