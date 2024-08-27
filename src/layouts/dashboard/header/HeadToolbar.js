/* eslint-disable react/prefer-stateless-function */
import React, { useContext, useEffect, useMemo, useState, HtmlHTMLAttributes } from 'react';
import PropTypes from 'prop-types';
import { Button, Stack, Typography, Autocomplete, TextField, Chip, Menu, MenuItem, ButtonProps, Breadcrumbs, Link, Box, Tooltip, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import SearchIcon from '@mui/icons-material/Search';
import { v4 } from 'uuid';
import { ThemeContext, UserContext, } from 'src/global';
import { createSearchParams, useNavigate } from 'react-router-dom';


const HeadToolbar = ({ routeName = '', breadcrumb = [], buttons = [], actions = [], searchFields = [], groupFields = [],
    onDomainChange = () => { }, ...others
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [search, setSearch] = useState('');
    const [searchSelected, setSearchSelected] = useState([])
    const { language, editing, showDialog } = useContext(UserContext)
    const { isDarkTheme } = useContext(ThemeContext)
    const navigate = useNavigate()
    const isMobile = useMediaQuery('(max-width:600px)');

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // const handelBreadcrumb = () => {
    //     if (key) {

    //     }
    // }

    const handelNavigate = (path, id, customRoutePlan) => {
        if (editing) {
            showDialog('Thông báo', 'Vui lòng lưu dữ liệu trước khi chuyển trang.')
        } else {
            if (customRoutePlan) {
                navigate({ pathname: path, search: id && createSearchParams({ plan: id, notifications: true }).toString() })
                return
            }
            navigate({ pathname: path, search: id && createSearchParams({ 'id': id, notifications: true }).toString() })
        }
    }

    const searchMemo = useMemo(() => searchFields.map(field => ({
        field: field.value, fieldName: field.text, value: [search],
        text: `${field.text} : ${search}`, label: `${language.findSomethingWithValue(field.text)} : ${search}`
    })), [search, searchFields, language])



    useEffect(() => {
        const getDomain = () => {
            const result = []
            searchSelected.forEach(s => {
                const domain = []
                domain.push([s.field, 'ilike', s.value[0]])
                const next = s.value.slice(1)
                next.forEach((sn) => {
                    domain.push([s.field, 'ilike', sn])
                    domain.unshift('|')
                })
                result.push(domain)
            })
            return result.flat()
        }
        onDomainChange(getDomain())
    }, [searchSelected,])


    return (
        <Stack direction={'row'} alignItems="flex-end" justifyContent="space-between"
            sx={{
                display: isMobile ? 'none' : 'flex', // Ẩn khi là mobile
                boxShadow: '0 0.75rem 1.5rem rgba(18, 38, 63, 0.03)', flexWrap: 'wrap',
                backgroundColor: isDarkTheme ? 'white' : '#121212', padding: '16px', borderRadius: '4px'
            }}>
            <Stack sx={{ flex: 1, gap: '8px' }}>
                <Breadcrumbs maxItems={5} separator="›" aria-label="breadcrumb">
                    {breadcrumb.map((b) => (
                        <Box key={v4()} component='div'>
                            <Tooltip title={b.chip}>
                                <Link sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => { handelNavigate(b.path, b.id, b.customRoutePlan) }}
                                    underline="hover" color="inherit" href={b.patch}>
                                    {b.name}
                                </Link>
                            </Tooltip>
                        </Box>
                    ))}
                    <Typography color="text.primary">{routeName}</Typography>
                </Breadcrumbs>
                <Stack sx={{ gap: '2%' }} direction={'row'}>
                    {buttons.map(({ text, onClick, buttonProps }) => (<Button sx={{ boxShadow: 'none', }} variant='contained' {...buttonProps} onClick={() => { onClick() }} key={v4()}>{text}</Button>))}
                </Stack>
            </Stack>
            {
                actions.length ?
                    <>
                        <Button color='success' title='Actions' variant='contained' onClick={handleClick}>Hành động</Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            sx={{ marginTop: '8px' }}
                        >
                            {actions.map(({ text, onClick }) => (<MenuItem onClick={() => { onClick(); handleClose() }} key={v4()}>{text}</MenuItem>))}
                        </Menu>
                    </> : null
            }
            <Stack sx={{ flex: 1, ml: 8 }}>
                {searchFields.length ?
                    <Autocomplete multiple
                        id="tags-filled"
                        options={searchMemo}
                        value={searchSelected}
                        renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="filled" label={option.text} {...getTagProps({ index })} key={v4()}
                            onDelete={(e) => {
                                setSearchSelected(searchSelected.filter(x => x.field !== option.field));
                            }} />))
                        }
                        isOptionEqualToValue={(o, v) => o.text === v.text}
                        onChange={(e, value) => {
                            if (!search) return
                            const distinct = value.filter((x, i) => value.findIndex(z => z.field === x.field) === i)
                            const mapped = distinct.map(x => {
                                // Chọn ra các field không trùng và gom giá trị
                                let selected = value.filter(z => z.field === x.field).map(z => z.value).flat()
                                // Với mỗi field, giá trị xuất hiện 2 lần sẽ bị loại
                                selected = selected.filter(v => (selected.filter(z => z === v).length % 2) === 1)
                                // Chỉnh lại giá trị text hiển thị
                                x.text = `${x.fieldName} : ${selected.join(` ${language.or} `)}`
                                // Gán lại giá trị lưu giữ
                                x.value = selected
                                console.log('x', x);
                                return x
                            })
                            setSearchSelected(mapped); setSearch('')
                        }}
                        // disableClearable
                        // isOptionEqualToValue={(option, value) => { console.log('option, value', option, value); return true }}
                        forcePopupIcon={false}
                        renderInput={(params) => (
                            <TextField
                                {...params} size={'small'}
                                variant="outlined"
                                onChange={(e) => { setSearch(e.target.value) }}
                                placeholder="Search"
                            />
                        )}
                    /> : null}

            </Stack>
        </Stack >
    );
};

HeadToolbar.propTypes = {
    routeName: PropTypes.string,
    buttons: PropTypes.array,
    actions: PropTypes.array,
    groupFields: PropTypes.array,
    searchFields: PropTypes.array,
    onDomainChange: PropTypes.func,
    breadcrumb: PropTypes.array
};
// eslint-disable-next-line
type HeaderToolbarType = HtmlHTMLAttributes | {
    routeName: String,
    buttons: [{ text: String, onClick: Function, buttonProps: ButtonProps }], actions: [{ text: String, onClick: Function }],
    groupFields: [{ text: String, value: String }], searchFields: [{ text: String, value: String }], onDomainChange: (domain: []) => void,
}
export default class HeaderToolbar extends React.Component<HeaderToolbarType>{
    render() {
        return <HeadToolbar {...this.props} />
    }
};