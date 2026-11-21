import React from 'react';
import PageRuntime from '../legacy/PageRuntime.jsx';
import tree from '../legacy/contact-tree.js';

export default function ContactPage() {
  return <PageRuntime page="contact" tree={tree} />;
}
