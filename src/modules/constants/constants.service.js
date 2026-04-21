import { toSentenceCase } from '../../utils/formatters.js';
import { Action, UserType, Portal, BusinessType, SupportType, ReportLevel, AccountGroup, AccountType, TransactionStatus, VendorType, Sex, ProgressStage, } from '../../generated/prisma/client.js';
export function getActions() {
    return Object.values(Action).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getUserTypes() {
    return Object.values(UserType).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getPortals() {
    return Object.values(Portal).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getBusinessTypes() {
    return Object.values(BusinessType).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getSupportTypes() {
    return Object.values(SupportType).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getReportLevels() {
    return Object.values(ReportLevel).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getAccountTypes() {
    return Object.values(AccountType).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getAccountGroups() {
    return Object.values(AccountGroup).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getTransactionStatuss() {
    return Object.values(TransactionStatus).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getVendorTypes() {
    return Object.values(VendorType).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getSexs() {
    return Object.values(Sex).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
export function getProgressStages() {
    return Object.values(ProgressStage).map((t) => ({ value: t, label: toSentenceCase(t) }));
}
