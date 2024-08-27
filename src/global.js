import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { Triangle } from 'react-loader-spinner';
import { v4 } from 'uuid'
import moment from 'moment';
import { Alert, Backdrop, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, Snackbar, Stack, Typography } from '@mui/material';
import vi from './i18n/vi';
import palette from './theme/palette';


// =====================Constant=====================
const MODEL_NAME = 'model.name'
const DATE_FORMAT = 'YYYY-MM-DD'
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT_TO_DISPLAY = 'DD-MM-YYYY'
const DATE_TIME_FORMAT_TO_DISPLAY = 'DD-MM-YYYY HH:mm:ss'



// =====================API=====================
const prodEnv = ''
// const devEnv = 'https://deverp.haophuong.com/'
// const devDbName = 'Testing-new'
// const devEnv = 'https://haophuong.id.vn:8014/'
// const devDbName = 'PRODUCTION231222'
const devEnv = 'https://erp.haophuong.com/'
const devDbName = 'PRODUCTION'
const prodDbName = ''

const host = devEnv ///
const isProduct = () => host === prodEnv
const getDbName = () => isProduct() ? prodDbName : devDbName
const api = {
    authenticate: `${host}web/session/authenticate`,
    getSessionInfo: `${host}web/session/get_session_info`,
    login: `${host}web/login`,
    logout: `${host}web/session/logout`,
    loadMenu: `${host}web/webclient/load_menus/`,// add session_id after link
    switchLanguage: `${host}web/dataset/call_kw/res.users/write`,
    searchRead: `${host}web/dataset/search_read`,
    readGroup: `${host}web/dataset/call_kw/model.name/read_group`,// replace model.name
    loadViews: `${host}web/dataset/call_kw/model.name/load_views`,// replace model.name
    nameSearch: `${host}web/dataset/call_kw/model.name/name_search`,// replace model.name
    read: `${host}web/dataset/call_kw/model.name/read`,// replace model.name
    onChange: `${host}web/dataset/call_kw/model.name/onchange`,// replace model.name
    defaultGet: `${host}web/dataset/call_kw/model.name/default_get`,// replace model.name
    create: `${host}web/dataset/call_kw/model.name/create`, // replace model.name
    write: `${host}web/dataset/call_kw/model.name/write`,// replace model.name
    unlink: `${host}web/dataset/call_kw/model.name/unlink`, // replace model.name
    callButton: `${host}web/dataset/call_button`,
    messageFormat: `${host}web/dataset/call_kw/mail.message/message_format`,

    readMessage: `${host}web/dataset/call_kw/mail.message/read`,
    getThreadMessages: `${host}mail/thread/messages`,
    initMessages: `${host}mail/init_messaging`,
    getUserActive: `${host}base_setup/data`,
    usersLogin: `${host}web/dataset/call_kw/users.login.history/read`,
    postComments: `${host}mail/message/post`,
    getMailActivity: `${host}web/dataset/call_kw/mail.activity/activity_format`,
    getActivityType: `${host}web/dataset/call_kw/mail.activity.type/name_get`,
    createMail: `${host}web/dataset/call_kw/mail.activity/create`, // replace model.name
    createUser: `${host}web/dataset/call_kw/res.users/create`, // replace model.name
    createPassword: `${host}web/dataset/call_kw/change.password.wizard/create`, // replace model.name
    changePassword: `${host}web/session/change_password`,
    getMailActionFeedback: `${host}web/dataset/call_kw/mail.activity/action_feedback`,

    get_current_assetss: `${host}balance_sheet/get_current_assets`,
    get_business_activities: `${host}balance_sheet/get_business_activities`,
    get_long_term_assets: `${host}balance_sheet/get_long_term_assets`,
    accounts_payable: `${host}balance_sheet/accounts_payable`,
    owner_equity: `${host}balance_sheet/owner_equity`,
    get_operating_activities: `${host}cash_flow/get_operating_activities`,
    get_revenues: `${host}balance_sheet/get_revenues`,
    get_selling_expensess: `${host}balance_sheet/get_selling_expenses`,
    get_management_expenses: `${host}balance_sheet/get_management_expenses`,
    get_control_index: `${host}balance_sheet/get_control_index`,
    get_revenue_by_business_unit: `${host}report/get_revenue_by_business_unit`,
    get_profit_by_business_unit: `${host}report/get_profit_by_business_unit`,
    get_business_activity_by_year: `${host}report/get_business_activity_by_year`,
    access_rights: `${host}api/user/access_rights`
}


// =====================Routes=====================
const routes = {
    // home: { path: '/', xmlID: '' },
    login: { path: '/login', xmlid: '' },
    home: { path: '/app', xmlid: 'haophuong_project.dashboard_menu_root' },
    settings: { path: '/settings', xmlid: 'base.menu_administration' },
    bookFinancial: { path: '/book-financial', xmlid: '' },
    recipe: { path: '/recipe', xmlid: '' },
    chart: { path: '/chart', xmlid: '' },
    accountModify: { path: '/account-modify', xmlid: '' },
    DetailaccountModify: { path: '/account-modify/detail', xmlid: '' },
    DetailBookFinancial: { path: '/book-financial/detail', xmlid: '' },
    accoutingFinacial: { path: '/accouting-financial', xmlid: '' },
    DetailAccoutingFinacial: { path: '/accouting-financial/detail', xmlid: '' },
    companyObjective: { path: '/company-objective', xmlid: '' },
    DetailCompanyObjective: { path: '/company-objective/detail', xmlid: '' },
    DetailObjectiveLine: { path: '/objective-line/detail', xmlid: '' },
    DetailObjectiveView: { path: '/objective/detail', xmlid: '' },
    objectiveView: { path: '/objective', xmlid: '' },

}

// =====================UTILS=====================
const sleep = ms => new Promise(r => setTimeout(r, ms))
const createFetchHeader = (options = {}) => ({ 'Content-type': 'application/json', ...options })
const mFetch = (url = '', params, { headers = {}, ...others }) => {
    if (typeof params === typeof {} && params)
        return fetch(url, {
            method: 'POST', credentials: 'include', ...others, headers: createFetchHeader(headers), body: JSON.stringify({ id: null, jsonrpc: '2.0', method: 'call', params })
        })
    return fetch(url, { credentials: 'include', ...others })
}

// =====================Option-Selection=====================
const mapFieldToOption = (field = [], additionalKey = '') => {
    const result = { text: field[1], value: field[0] };
    if (additionalKey) result[additionalKey] = field[1];
    return result;
};

const getFieldSelection = (fieldOfView = {}, fieldName = '') => {
    const selection = (fieldOfView[fieldName] && fieldOfView[fieldName].selection) || [];
    return selection.map((value) => mapFieldToOption(value));
};

const compareObjects = (oldObj, newObj) => {
    const diffInfoObj = {}
    Object.entries(newObj).forEach(([key, value]) => {
        if (oldObj[key] !== value) {
            diffInfoObj[key] = value
        }
    })
    return diffInfoObj;
}





// format tiền tệ
const formatterRevenue = new Intl.NumberFormat('vi-VN');

const ThemeContext = createContext({
    // eslint-disable-next-line
    appTheme: 'light', setAppTheme: (theme = 'light') => { }, isDarkTheme: false, switchAppTheme: () => { }
})


const UserContext = createContext({
    // eslint-disable-next-lineF
    user: false, setUser: () => { }, language: vi, setLanguage: (language = vi) => { }, loading: false, setLoading: (loading) => { },
    timer: false, setTimer: () => { }, sleep, psms: [],
    // eslint-disable-next-line
    xhr: async (url = '', params = {}, { headers = {}, ...others }) => { }, showDialog: (title = '', message = '', actions = [{ text: '', onClick: () => { }, buttonProps: {} }]) => { },
    // eslint-disable-next-line
    showNotification: (title = '', message = '', actions = [{ text: '', onClick: () => { }, buttonProps: {} }]) => { },
    // eslint-disable-next-line
    loadMenu: async () => { }, getSessionInfo: async () => { },
    // eslint-disable-next-line
    loadViews: async (model = '', views = ['list', 'form', 'search']) => { }, searchRead: async (model = '', fields = [], domain = [], options = { sort: '', limit: 80, offset: 0, max_id: 0 }) => { },
    // eslint-disable-next-line
    read: async (model = '', ids = [], fields = []) => { }, create: async (model = '', item = {}) => { }, write: async (model = '', ids = [], changedValue = {}) => { },
    // eslint-disable-next-line
    unlink: async (model = '', ids = []) => { }, callButton: async (model = '', ids = [], method = '') => { }, messageFormat: async (ids = []) => { },
    // eslint-disable-next-line
    nameSearch: async (model = '', name = '') => { },
    // eslint-disable-next-line
    nameSearchCurrency: async (model = '', name = '') => { },
    // eslint-disable-next-line
    readMessage: async (id) => { },
    // eslint-disable-next-line
    getThreadMessages: async (threadId, limit, model) => { },
    // eslint-disable-next-line
    getMailActivity: async (ids = []) => { },
    // eslint-disable-next-line
    getActivityType: async (ids = []) => { },
    // eslint-disable-next-line
    getMailActionFeedback: async (ids = [], attachment_ids = [], feedback = '') => { },
    // eslint-disable-next-line
    createMail: async (model = '', item = {}, default_res_id, default_res_model) => { },
    // eslint-disable-next-line
    createUser: async (model = '', item = {}) => { },
    // eslint-disable-next-line
    createPassword: async (model = '', item = {}) => { },
    // eslint-disable-next-line
    changePassword: async (item = {}) => { },
    // eslint-disable-next-line
    initMessages: async () => { },
    // eslint-disable-next-line
    getUserActive: async () => { },
    // eslint-disable-next-line
    userLogin: async (model = '', ids = [], feildName = []) => { },
    // eslint-disable-next-line
    post: async (model = '', item = {}, thread_id) => { },
    // eslint-disable-next-line
    nameSearchManager: async (model = '', name = '') => { },
    // eslint-disable-next-line
    getBusinessActivities: () => { },
    // eslint-disable-next-line
    getSellingExpensess: () => { },
    // eslint-disable-next-line
    getRevenues: () => { },
    // eslint-disable-next-line
    getOperatingActivities: () => { },
    // eslint-disable-next-line
    getbusinessActivityByYear: (year, business_unit_id, branch_id) => { },
    // eslint-disable-next-line
    getCurrentAssetss: () => { },
    // eslint-disable-next-line
    ownerEquity: () => { },
    // eslint-disable-next-line
    accountsPayable: () => { },
    // eslint-disable-next-line
    getLongTermAssets: () => { },
    // eslint-disable-next-line
    getManagementExpenses: () => { },
    // eslint-disable-next-line
    getControlIndex: () => { },
    // eslint-disable-next-line
    getCurrentAssetssFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getLongTermAssetsFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    accountsPayableFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    ownerEquityFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getBusinessActivitiesFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getOperatingActivitiesFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getControlIndexFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getManagementExpensesFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getSellingExpensessFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getRevenuesFilter: async (branch_id, business_unit_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getRevenueByBusinessUnit: async (branch_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    getProfitByBusinessUnit: async (branch_id, starting_date, ending_date) => { },
    // eslint-disable-next-line
    accessRights: async () => { },
})

function TransitionRight(props) {
    return <Slide {...props} direction="right" />;
}

function UserProvider({ children }) {
    const [user, setUser] = useState({})
    const [language, setLanguage] = useState(vi)
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState({})
    const [notification, setNotification] = useState({})
    const [timer, setTimer] = useState(localStorage.getItem('lastLoginTime') || null)
    const psms = JSON.parse(localStorage.getItem('psm'))


    const navigate = useNavigate()

    const showDialog = (title = '', message = '', actions = []) => {
        setDialog({ title, message, actions, open: true })
    }

    const showNotification = (title = '', message = '', type = '', params = {}) => {
        setNotification({ title, message, type, params, open: true })
    }

    const xhr = async (url = '', params, option = {}) => {
        const { headers, ...others } = option
        const response = await mFetch(url, params, { headers, ...others })
        const json = await response.json()
        if (json.error?.code === 100) {
            setUser({})
            showDialog('', json.error?.data?.message)
            if (window.location.pathname !== routes.login.path) {
                navigate(routes.login.path)
            }
        }
        return json
    }

    const nameSearch = async (model = '', name = '') => {
        const json = await xhr(api.nameSearch.replace(MODEL_NAME, model), {
            model, method: 'name_search', args: [],
            kwargs: {
                name,
                args: [],
                context: user.user_context,
                limit: 150,
                operator: "ilike"
            }
        })
        return json
    }

    const nameSearchManager = async (model = '', name = '') => {
        const json = await xhr(api.searchRead.replace(MODEL_NAME, model), {
            model, method: 'read_group', context: user.user_context,
            fields: ["employee_id"],
            domain: [["groups_id", "in", [14]]],
            lazy: true,
            orderby: "sort",
        })
        return json
    }


    const nameSearchCurrency = async (model = '', name = '') => {
        const json = await xhr(api.nameSearch.replace(MODEL_NAME, model), {
            model, method: 'name_search', args: [],
            kwargs: {
                name,
                args: [
                    "|",
                    ["active", "=", true],
                    ["active", "=", false],
                    ["name", "in", ["USD", "VND"]],
                ],
                context: user.user_context,
                limit: 150,
                operator: "ilike"
            }
        })
        return json
    }

    const getSessionInfo = async () => {
        const json = await xhr(api.getSessionInfo, {})
        if (json.result) {
            setUser(json.result)
            localStorage.setItem('load_menus', json.result.cache_hashes?.load_menus)
        }
        return json
    }

    const loadMenu = async () => {
        const cacheLoadMenu = localStorage.getItem('load_menus')
        const json = await xhr(api.loadMenu + cacheLoadMenu)
        return json
    }

    const loadViews = async (model = '', views = ['list', 'form', 'search']) => {
        const json = await xhr(api.loadViews.replace(MODEL_NAME, model), {
            model, method: 'load_views', args: [],
            kwargs: {
                views: views.map(v => ([false, v])),
                context: user.user_context
            },
        })
        return json
    }

    const searchRead = async (model = '', fields = [], domain = [], options = { sort: '', limit: 80, offset: 0, max_id: 0 }) => {
        const { sort, limit, offset, max_id } = options
        const json = await xhr(api.searchRead, { context: user.user_context, model, fields, domain, sort, limit, offset, })
        return json
    }

    const read = async (model = '', ids = [], fields = []) => {
        const json = await xhr(api.read.replace(MODEL_NAME, model), { args: [ids, fields], kwargs: { context: user.user_context }, model, method: 'read', })
        return json
    }

    const create = async (model = '', item = {}) => {
        const json = await xhr(api.create.replace(MODEL_NAME, model), { args: [item], kwargs: { context: user.user_context }, model, method: 'create', })
        return json
    }

    const createUser = async (model = '', item = {}) => {
        const json = await xhr(api.createUser.replace(MODEL_NAME, model), {
            args: [item], kwargs: {
                context: {
                    ...user.user_context, module: "general_settings", active_model: "res.config.settings",
                    search_default_no_share: 1, bin_size: false, "allowed_company_ids": [1]
                }

            }, model, method: 'create',
        })
        return json
    }

    const createPassword = async (model = '', item = {}) => {
        const json = await xhr(api.createPassword.replace(MODEL_NAME, model), {
            args: [{ user_ids: [[0, "virtual_189", item]] }], kwargs: {
                context: {
                    ...user.user_context,
                    active_domain: [["share", "=", false]], active_id: item.id,
                    active_model: 'res.users', "allowed_company_ids": [1]
                }

            }, model, method: 'create',
        })
        return json
    }

    const changePassword = async (model = '', item = []) => {
        const json = await xhr(api.changePassword.replace(MODEL_NAME, model), {
            fields: item
        })
        return json
    }

    const createMail = async (model = '', item = {}, default_res_id, default_res_model) => {
        const json = await xhr(api.createMail.replace(MODEL_NAME, model), {
            args: [item], kwargs: {
                context: {
                    ...user.user_context, 'default_res_id': default_res_id
                    , 'default_res_model': default_res_model, 'allowed_company_ids': [1]
                }
            }, model, method: 'create',
        })
        return json
    }

    const post = async (model = '', item = {}, thread_id) => {
        const json = await xhr(api.postComments.replace(MODEL_NAME, model), { post_data: item, thread_id, thread_model: model, context: { "mail_post_autofollow": true }, method: 'call', })
        return json
    }

    const write = async (model = '', ids = [], changedValue = {}) => {
        const json = await xhr(api.write.replace(MODEL_NAME, model), { args: [ids, changedValue], kwargs: { context: user.user_context }, model, method: 'write', })
        return json
    }

    const unlink = async (model = '', ids = []) => {
        const json = await xhr(api.unlink.replace(MODEL_NAME, model), { args: [ids], kwargs: { context: user.user_context }, model, method: 'unlink', })
        return json
    }


    const callButton = async (model = '', ids = [], method = '') => {
        const json = await xhr(api.callButton, { args: [ids], kwargs: { context: user.user_context }, model, method })
        return json
    }

    const messageFormat = async (ids = []) => {
        const json = await xhr(api.messageFormat, { args: [ids], kwargs: { context: user.user_context }, model: 'mail.message', method: 'message_format', })
        return json
    }

    const readMessage = async (id) => {
        const json = await xhr(api.readMessage, {
            model: "mail.message",
            method: "read",
            args: [id, ["date", "subject", "author_id", "model", "res_id"]],
            kwargs: { context: user.user_context },
        });
        return json;
    };

    const userLogin = async (model = '', ids = [], feildName = [], active_id, active_ids = [], allowed_company_ids = [], params = {}, search_default_no_share) => {
        console.log('user.user_context', user.user_context);
        const json = await xhr(api.usersLogin.replace(MODEL_NAME, model), {
            args: [ids, feildName], kwargs: {
                context: {
                    ...user.user_context, search_default_no_share,
                    active_id, active_ids, allowed_company_ids, params,
                }
            }, model, method: 'read',
        })
        return json
    }

    const getThreadMessages = async (threadId, limit, max_id = 0, model) => {
        const json = await xhr(api.getThreadMessages, {
            model: "mail.thread",
            method: "call",
            thread_id: threadId,
            thread_model: model,
            limit,
            max_id,
            kwargs: { context: user.user_context },
        });
        return json;
    };

    const getMailActivity = async (ids = []) => {
        const json = await xhr(api.getMailActivity, {
            model: "mail.activity",
            method: "activity_format",
            args: [ids],
            kwargs: { context: user.user_context },
        });
        return json;
    };

    const getMailActionFeedback = async (ids = [], attachment_ids = [], feedback = '') => {
        const json = await xhr(api.getMailActionFeedback, {
            model: "mail.activity",
            method: "action_feedback",
            args: [ids],
            kwargs: { context: user.user_context, attachment_ids, feedback },
        });
        return json;
    };

    const getActivityType = async (ids = []) => {
        const json = await xhr(api.getActivityType, {
            model: "mail.activity.type",
            method: "name_get",
            args: [ids],
            kwargs: { context: user.user_context },
        });
        return json;
    };

    const initMessages = async () => {
        const json = await xhr(api.initMessages, { method: "call", })
        return json
    }

    const getUserActive = async () => {
        const json = await xhr(api.getUserActive, { method: "call" })
        return json
    }

    const getBusinessActivities = async () => {
        const json = await xhr(api.get_business_activities, {})
        return json
    }

    const getLongTermAssets = async () => {
        const json = await xhr(api.get_long_term_assets, {})
        return json
    }

    const accountsPayable = async () => {
        const json = await xhr(api.accounts_payable, {})
        return json
    }

    const ownerEquity = async () => {
        const json = await xhr(api.owner_equity, {})
        return json
    }

    const getCurrentAssetss = async () => {
        const json = await xhr(api.get_current_assetss, {})
        return json
    }


    const getCurrentAssetssFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_current_assetss, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };


    const getLongTermAssetsFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_long_term_assets, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };


    const accountsPayableFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.accounts_payable, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const ownerEquityFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.owner_equity, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getBusinessActivitiesFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_business_activities, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getOperatingActivitiesFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_operating_activities, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getRevenuesFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_revenues, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getSellingExpensessFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_selling_expensess, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getManagementExpensesFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_management_expenses, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getControlIndexFilter = async (branch_id, business_unit_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            business_unit_id: business_unit_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_control_index, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };


    const getRevenueByBusinessUnit = async (branch_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_revenue_by_business_unit, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getProfitByBusinessUnit = async (branch_id, starting_date, ending_date) => {
        const bodyData = {
            branch_id: branch_id || false,
            starting_date,
            ending_date
        };

        try {
            const response = await fetch(api.get_profit_by_business_unit, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getOperatingActivities = async () => {
        const json = await xhr(api.get_operating_activities, {})
        return json
    }


    const getbusinessActivityByYear = async (year, business_unit_id, branch_id) => {
        const bodyData = {
            branch_id: branch_id || false,
            year,
            business_unit_id,
        };

        try {
            const response = await fetch(api.get_business_activity_by_year, {
                method: 'POST',
                credentials: 'include', // Nếu cần gửi cookies hoặc thông tin xác thực
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };


    const getRevenues = async () => {
        const json = await xhr(api.get_revenues, {})
        return json
    }

    const getSellingExpensess = async () => {
        const json = await xhr(api.get_selling_expensess, {})
        return json
    }

    const getManagementExpenses = async () => {
        const json = await xhr(api.get_management_expenses, {})
        return json
    }

    const getControlIndex = async () => {
        const json = await xhr(api.get_control_index, {})
        return json
    }

    const accessRights = async () => {
        const json = await xhr(api.access_rights, {})
        return json
    }



    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden';
            const triangle = document.getElementById('triangle').childNodes.item(0)
            triangle.setAttribute('stroke-width', 2)
            console.log(triangle);
        }
        else document.body.style.overflow = 'unset';
    }, [loading])




    return (
        <UserContext.Provider value={{
            user, setUser, language, setLanguage, timer, setTimer, loading, setLoading, psms, showDialog, showNotification, post, getMailActivity, getMailActionFeedback, createMail,
            xhr, getSessionInfo, loadMenu, loadViews, searchRead, read, create, write, unlink, callButton, nameSearchCurrency, createUser, createPassword, changePassword,
            messageFormat, nameSearch, readMessage, getThreadMessages, initMessages, getUserActive, userLogin, getActivityType, nameSearchManager, getBusinessActivities,
            getManagementExpenses, getSellingExpensess, getRevenues, getOperatingActivities, getCurrentAssetss, ownerEquity, accountsPayable, getLongTermAssets, getbusinessActivityByYear,
            getControlIndex, getCurrentAssetssFilter, getLongTermAssetsFilter, accountsPayableFilter, ownerEquityFilter, getBusinessActivitiesFilter, getOperatingActivitiesFilter,
            getControlIndexFilter, getManagementExpensesFilter, getSellingExpensessFilter, getRevenuesFilter, getRevenueByBusinessUnit, getProfitByBusinessUnit, accessRights
        }}>

            {children}
            <Dialog PaperProps={{
                sx: {
                    width: "50%",
                    maxHeight: 300
                }
            }} open={dialog.open === true} disableEscapeKeyDown key={v4()}
                onClose={() => { setDialog({}) }}
            >
                <DialogTitle>
                    {dialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText >
                        {dialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ gap: '8px', padding: '16px' }}>
                    {dialog.actions?.map(({ text = '', onClick = () => { }, buttonProps = {} }) => (
                        <Button sx={{ boxShadow: 'none' }} key={v4()} onClick={() => { setDialog({}); onClick(); }} {...buttonProps}>{text}</Button>
                    ))}
                </DialogActions>
            </Dialog>
            <Backdrop open={loading}
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', userSelect: 'none' }}
            >
                <Triangle
                    height="124"
                    width="124"
                    color={palette.primary.main}
                    ariaLabel="triangle-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible
                />
                <Typography sx={{ mt: 1, color: 'white' }}>{language.loading}</Typography>
            </Backdrop>
            <Snackbar
                sx={{ cursor: 'pointer' }}
                // onClick={() => { handelNavigate(notification.params.model, notification.params.res_id) }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={notification.open === true}
                autoHideDuration={1500}
                TransitionComponent={TransitionRight}
                onClose={() => {
                    setNotification({});
                }}
            // message={dialog.message}
            >
                <Alert onClose={() => {
                    setNotification({});

                }}
                    severity={notification?.type || 'info'}
                    variant="filled"
                    sx={{ width: '100%' }}>
                    <Stack direction='column'>
                        <Typography variant='button'>{notification.title}</Typography>
                        {notification.message}
                    </Stack>
                </Alert>
            </Snackbar>
        </UserContext.Provider>
    )
}



UserProvider.propTypes = {
    children: PropTypes.node
}

const getImgUser = (id) => id ? `${host}web/image?model=res.users&field=avatar_128&id=${id}` : '/assets/images/avatars/avatar_1.jpg';


const getImgUserLog = (id) => id ? `${host}web/image/res.partner/${id}/avatar_128` : '/assets/images/avatars/avatar_1.jpg'

const fakeData = [
    {
        "starting_date": "2024-01-01 00:00:00",
        "ending_date": "2024-01-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-02-01 00:00:00",
        "ending_date": "2024-02-29 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 180423843.0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 180423843.0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 180423843.0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 180423843.0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 180423843.0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 180423843.0
            }
        ]
    },
    {
        "starting_date": "2024-03-01 00:00:00",
        "ending_date": "2024-03-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-04-01 00:00:00",
        "ending_date": "2024-04-30 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-05-01 00:00:00",
        "ending_date": "2024-05-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-06-01 00:00:00",
        "ending_date": "2024-06-30 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-07-01 00:00:00",
        "ending_date": "2024-07-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-08-01 00:00:00",
        "ending_date": "2024-08-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-09-01 00:00:00",
        "ending_date": "2024-09-30 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-10-01 00:00:00",
        "ending_date": "2024-10-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-11-01 00:00:00",
        "ending_date": "2024-11-30 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    },
    {
        "starting_date": "2024-12-01 00:00:00",
        "ending_date": "2024-12-31 00:00:00",
        "value": [
            {
                "description": "VII.1",
                "code": "01",
                "name": "1. Doanh thu bán hàng và cung cấp dịch vụ",
                "formula": "Phát sinh có (511) - Phát sinh Đối Ứng (911/511) - Phát sinh Nợ (511) + Phát sinh Đối Ứng (511/521) + Phát sinh Đối Ứng (511/911)",
                "value": 0
            },
            {
                "description": "VII.2",
                "code": "02",
                "name": "2. Các khoản giảm trừ doanh thu",
                "formula": "Phát sinh Đối Ứng (511/521)",
                "value": 0
            },
            {
                "description": "",
                "code": "10",
                "name": "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ",
                "formula": "01 - 02",
                "value": 0
            },
            {
                "description": "VII.3",
                "code": "11",
                "name": "4. Giá vốn hàng bán",
                "formula": "Phát sinh Đối Ứng (911/632) - Phát sinh Đối Ứng (632/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "20",
                "name": "5. Lợi nhuận gộp về hàng bán và cung cấp dịch vụ",
                "formula": "10 - 11",
                "value": 0
            },
            {
                "description": "VII.4",
                "code": "21",
                "name": "6. Doanh thu hoạt động tài chính",
                "formula": "Phát sinh Đối Ứng (515/911) - Phát sinh Đối Ứng (911/515)",
                "value": 0
            },
            {
                "description": "VII.5",
                "code": "22",
                "name": "7. Chi phí tài chính",
                "formula": "Phát sinh Đối Ứng (911/635) - Phát sinh Đối Ứng (635/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "23",
                "name": "- Trong đó: chi phí lãi vay",
                "formula": "Phát sinh Đối Ứng (911/6351) + Phát sinh Đối Ứng (6351/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "25",
                "name": "8. Chi phí bán hàng",
                "formula": "Phát sinh Đối Ứng (911/641) - Phát sinh Đối Ứng (641/911)",
                "value": 0
            },
            {
                "description": "VII.8",
                "code": "26",
                "name": "9. Chi phí quản lý doanh nghiệp",
                "formula": "Phát sinh Đối Ứng (911/642) - Phát sinh Đối Ứng (642/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "30",
                "name": "10. Lợi nhuận thuần từ hoạt động kinh doanh",
                "formula": "20 + (21 - 22) - 25 - 26",
                "value": 0
            },
            {
                "description": "VII.6",
                "code": "31",
                "name": "11. Thu nhập khác",
                "formula": "Phát sinh Đối Ứng (711/911)",
                "value": 0
            },
            {
                "description": "VII.7",
                "code": "32",
                "name": "12. Chi phí khác",
                "formula": "Phát sinh Đối Ứng (911/811)",
                "value": 0
            },
            {
                "description": "",
                "code": "40",
                "name": "13. Lợi nhuận khác",
                "formula": "31 - 32",
                "value": 0
            },
            {
                "description": "",
                "code": "50",
                "name": "14. Tổng lợi nhuận kế toán trước thuế",
                "formula": "30 + 40",
                "value": 0
            },
            {
                "description": "VII.10",
                "code": "51",
                "name": "15. Chi phí thuế TNDN hiện hành",
                "formula": "Phát sinh Đối Ứng (911/8211) - Phát sinh Đối Ứng (8211/911)",
                "value": 0
            },
            {
                "description": "VII.11",
                "code": "52",
                "name": "16. Chi phí thuế TNDN hoãn lại",
                "formula": "Phát sinh Đối Ứng (911/8212) - Phát sinh Đối Ứng (8212/911)",
                "value": 0
            },
            {
                "description": "",
                "code": "60",
                "name": "17. Lợi nhuận sau thuế thu nhập doanh nghiệp",
                "formula": "50 - 51 - 52",
                "value": 0
            }
        ]
    }
]

export {
    UserContext, UserProvider, ThemeContext, routes, DATE_FORMAT, DATE_TIME_FORMAT, DATE_FORMAT_TO_DISPLAY, getDbName,
    DATE_TIME_FORMAT_TO_DISPLAY, api, mapFieldToOption, getFieldSelection, compareObjects, getImgUser, getImgUserLog,
    formatterRevenue, fakeData
}