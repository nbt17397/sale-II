import React from 'react';
import PropTypes from 'prop-types';
import './Wrapper.css'

const Wrapper = ({ className = '', scroll, children, ...others }) => {
    return (
        <div className={'wrapper '(scroll ? 'wrapper-scroll ' : '') + className} {...others}>
            {children}
        </div>
    );
};

Wrapper.propTypes = {
    className: PropTypes.string,
    scroll: PropTypes.bool,
};

const Container = ({ className = '', overFlowInit, animation = false, horizontal = false, center = false, scroll, children, ...others }) => {
    return (
        <div className={[
            'container',
            (center ? ' center' : ''),
            (animation ? ' container-animation' : ''),
            (horizontal ? ' container-horizontal' : ''),
            (scroll ? ' container-scroll' : ''),
            (overFlowInit ? ' container-init' : ''),
            className].join(' ')}
            {...others}>
            {children}
        </div>
    );
};

Container.propTypes = {
    className: PropTypes.string,
    center: PropTypes.bool,
    animation: PropTypes.bool,
    scroll: PropTypes.bool,
    style: PropTypes.object
};


const Row = ({ className = '', fitWidth = false, fitHeight = false, children, ...others }) => {
    return (
        <div className={`column${fitWidth ? ' fit-width' : ''}${fitHeight ? ' fit-height' : ''}${className ? ` ${className}` : ''}`} {...others}>
            {children}
        </div>
    )
}
Row.propTypes = {
    className: PropTypes.string,
    fitWidth: PropTypes.bool,
    fitHeight: PropTypes.bool,
};
const Column = ({ className = '', fitWidth = false, fitHeight = false, children, ...others }) => {
    return (
        <div className={`column${fitWidth ? ' fit-width' : ''}${fitHeight ? ' fit-height' : ''}${className ? ` ${className}` : ''}`} {...others}>
            {children}
        </div>
    )
}
Column.propTypes = {
    className: PropTypes.string,
    fitWidth: PropTypes.bool,
    fitHeight: PropTypes.bool,
};


const TabPanel = (props) => {
    const { children, value, index, className = '', contentContainerClass = '', contentContainerStyle = {}, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            className={`tab-panel ${value === index ? 'tab-panel-fade' : ''} ${className}`}
            {...other}
        >
            {value === index && (
                <Container className={contentContainerClass} style={contentContainerStyle}>
                    {children}
                </Container>
            )}
        </div>
    );
}
TabPanel.propTypes = {
    dir: PropTypes.string,
    index: PropTypes.number,
    value: PropTypes.number,
    className: PropTypes.string,
    contentContainerStyle: PropTypes.object,
}


export default Wrapper;
export { Container, Row, Column, TabPanel }