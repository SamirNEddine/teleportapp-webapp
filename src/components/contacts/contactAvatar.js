import React from 'react';
import { motion } from 'framer-motion';

export const ContactAvatar = function ({positionClassName}) {
    // return <motion.div className={'contact-avatar ' + positionClassName} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} />;
    return <div className={'contact-avatar ' + positionClassName}></div>
};