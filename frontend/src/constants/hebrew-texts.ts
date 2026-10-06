import { RecordStatus, Role } from '@library/shared';

// All visible UI text in one place (Hebrew)
export const HebrewTexts = {
  applicationName: 'מערכת ניהול ספרייה',

  navigation: {
    dashboard: 'לוח בקרה',
    books: 'ספרים',
    browseBooks: 'עיון בספרים',
    members: 'מנויים',
    loans: 'השאלות',
    users: 'משתמשים',
    auditLogs: 'יומן פעולות',
    settings: 'הגדרות',
    profile: 'פרופיל',
    home: 'ראשי',
  },

  authentication: {
    loginTitle: 'התחברות',
    loginSubtitle: 'ברוכים הבאים למערכת הספרייה',
    loginButton: 'התחברות',
    registerTitle: 'הרשמה',
    registerSubtitle: 'יצירת חשבון חדש',
    registerButton: 'הרשמה',
    logout: 'התנתקות',
    noAccountQuestion: 'אין לך חשבון?',
    registerLink: 'להרשמה',
    haveAccountQuestion: 'כבר יש לך חשבון?',
    loginLink: 'להתחברות',
    invalidCredentials: 'אימייל או סיסמה שגויים',
    emailAlreadyRegistered: 'כתובת האימייל כבר רשומה במערכת',
    registrationSucceeded: 'ההרשמה הושלמה בהצלחה, ניתן להתחבר',
    sessionExpired: 'פג תוקף ההתחברות, יש להתחבר מחדש',
    passwordsDoNotMatch: 'הסיסמאות אינן תואמות',
    personalDetailsSection: 'פרטים אישיים',
    addressSection: 'כתובת',
  },

  fields: {
    email: 'אימייל',
    password: 'סיסמה',
    confirmPassword: 'אימות סיסמה',
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'טלפון',
    street: 'רחוב',
    houseNumber: 'מספר בית',
    apartmentOrUnit: 'דירה',
    city: 'עיר',
    postalCode: 'מיקוד (לא חובה)',
    currentPassword: 'סיסמה נוכחית',
    newPassword: 'סיסמה חדשה',
    confirmNewPassword: 'אימות סיסמה חדשה',
  },

  errors: {
    unauthorizedTitle: 'אין הרשאה',
    unauthorizedDescription: 'אין לך הרשאה לצפות בעמוד זה.',
    notFoundTitle: 'העמוד לא נמצא',
    notFoundDescription: 'העמוד שחיפשת אינו קיים או שהועבר.',
    backToHome: 'חזרה לדף הראשי',
    invalidInput: 'הנתונים שהוזנו אינם תקינים',
    forbiddenAction: 'אין לך הרשאה לבצע פעולה זו',
    recordNotFound: 'הרשומה המבוקשת לא נמצאה',
    conflict: 'הפעולה מתנגשת בנתונים קיימים',
    serverError: 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר',
    networkError: 'אין חיבור לשרת, בדקו את החיבור ונסו שוב',
  },

  profile: {
    pageTitle: 'הפרופיל שלי',
    personalDetailsTitle: 'פרטים אישיים',
    saveChanges: 'שמירת שינויים',
    profileUpdated: 'הפרטים עודכנו בהצלחה',
    changePasswordTitle: 'שינוי סיסמה',
    changePasswordButton: 'עדכון סיסמה',
    passwordChanged: 'הסיסמה עודכנה בהצלחה',
    incorrectCurrentPassword: 'הסיסמה הנוכחית שגויה',
    accountInformationTitle: 'פרטי חשבון',
    role: 'תפקיד',
    membershipStatus: 'סטטוס מנוי',
    lastLogin: 'התחברות אחרונה',
    noLastLogin: 'אין נתון',
  },

  membershipStatuses: {
    [RecordStatus.ACTIVE]: 'מנוי פעיל',
    [RecordStatus.DISABLED]: 'מנוי מושבת',
  },

  placeholders: {
    comingSoon: 'העמוד בפיתוח ויהיה זמין בקרוב.',
    dashboardWelcome: 'שלום',
  },

  roles: {
    [Role.ADMIN]: 'מנהל מערכת',
    [Role.LIBRARIAN]: 'ספרן',
    [Role.MEMBER]: 'מנוי',
    [Role.VIEWER]: 'אורח',
  },
} as const;
