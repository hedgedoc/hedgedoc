import React, { Fragment, useState } from 'react'
import { Button, Card, Col, Modal, Row, Table } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { TranslatedExternalLink } from '../../common/links/translated-external-link'

export const HelpButton: React.FC = () => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)
  return (
    <Fragment>
      <Button title={t('editor.menu.help')} className="ml-2 text-secondary" size="sm" variant="outline-light"
        onClick={handleShow}>
        <ForkAwesomeIcon icon="question-circle"/>
      </Button>
      <Modal show={show} onHide={handleClose} animation={true} className="text-dark" size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            <ForkAwesomeIcon icon="question-circle"/> <Trans i18nKey={'editor.menu.help'}/>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-dark">
          <Row>
            <Col lg={4}>
              <Card>
                <Card.Header><Trans i18nKey='editor.help.contacts.title'/></Card.Header>
                <Card.Body>
                  <Card.Text>
                    <ul className="list-unstyled">
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.contacts.community'
                          href='https://community.codimd.org/'
                          icon='users'
                          className='text-primary'
                        />
                      </li>
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.contacts.meetUsOn'
                          i18nOption={{ service: 'Matrix' }}
                          href='https://riot.im/app/#/room/#codimd:matrix.org'
                          icon='hashtag'
                          className='text-primary'
                        />
                      </li>
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.contacts.reportIssue'
                          href='https://github.com/codimd/server/issues'
                          icon='tag'
                          className='text-primary'
                        />
                      </li>
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.contacts.helpTranslating'
                          href='https://translate.codimd.org/'
                          icon='language'
                          className='text-primary'
                        />
                      </li>
                    </ul>
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card>
                <Card.Header><Trans i18nKey='editor.help.documents.title'/></Card.Header>
                <Card.Body>
                  <Card.Text>
                    <ul className="list-unstyled">
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.documents.features'
                          href='/n/features'
                          icon='dot-circle-o'
                          className='text-primary'
                        />
                      </li>
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.documents.yamlMetadata'
                          href='/n/yaml-data'
                          icon='dot-circle-o'
                          className='text-primary'
                        />
                      </li>
                      <li>
                        <TranslatedExternalLink
                          i18nKey='editor.help.documents.slideExample'
                          href='https://github.com/codimd/server/issues'
                          icon='dot-circle-o'
                          className='text-primary'
                        />
                      </li>
                    </ul>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8}>
              <Card>
                <Card.Header><Trans i18nKey='editor.help.cheatsheet.title'/></Card.Header>
                <Card.Body>
                  <Card.Text>
                    <Table className="table-condensed table-cheatsheet">
                      <thead>
                        <tr>
                          <td><Trans i18nKey='editor.help.cheatsheet.example'/></td>
                          <td><Trans i18nKey='editor.help.cheatsheet.syntax'/></td>
                        </tr>
                      </thead>
                      <tbody className="markdown-body"
                        style={{ fontFamily: 'inherit', fontSize: '14px', padding: 0, maxWidth: 'inherit' }}>
                        <tr>
                          <td><Trans i18nKey='editor.editorToolbar.header'/></td>
                          <td>
                            <pre># <Trans i18nKey='editor.editorToolbar.header'/></pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <ul>
                              <li><Trans i18nKey='editor.editorToolbar.unorderedList'/></li>
                            </ul>
                          </td>
                          <td>
                            <pre>- <Trans i18nKey='editor.editorToolbar.unorderedList'/></pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <ol>
                              <li><Trans i18nKey='editor.editorToolbar.orderedList'/></li>
                            </ol>
                          </td>
                          <td>
                            <pre>1. <Trans i18nKey='editor.editorToolbar.orderedList'/></pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <ul>
                              <li className="task-list-item">
                                <input type="checkbox" className="task-list-item-checkbox" disabled={false}/>
                                <label><Trans i18nKey='editor.editorToolbar.checkList'/></label>
                              </li>
                            </ul>
                          </td>
                          <td>
                            <pre>- [ ] <Trans i18nKey='editor.editorToolbar.checkList'/></pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <blockquote><Trans i18nKey='editor.editorToolbar.blockquote'/></blockquote>
                          </td>
                          <td>
                            <pre>{'>'} <Trans i18nKey='editor.editorToolbar.blockquote'/></pre>
                          </td>
                        </tr>
                        <tr>
                          <td><strong><Trans i18nKey='editor.editorToolbar.bold'/></strong></td>
                          <td>
                            <pre>**<Trans i18nKey='editor.editorToolbar.bold'/>**</pre>
                          </td>
                        </tr>
                        <tr>
                          <td><i><Trans i18nKey='editor.editorToolbar.italic'/></i></td>
                          <td>
                            <pre>*<Trans i18nKey='editor.editorToolbar.italic'/>*</pre>
                          </td>
                        </tr>
                        <tr>
                          <td><s><Trans i18nKey='editor.editorToolbar.strikethrough'/></s></td>
                          <td>
                            <pre>~~<Trans i18nKey='editor.editorToolbar.strikethrough'/>~~</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>19<sup>th</sup></td>
                          <td>
                            <pre>19^th^</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>H<sub>2</sub>O</td>
                          <td>
                            <pre>H~2~O</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <ins><Trans i18nKey='editor.help.cheatsheet.underlinedText'/></ins>
                          </td>
                          <td>
                            <pre>++<Trans i18nKey='editor.help.cheatsheet.underlinedText'/>++</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <mark><Trans i18nKey='editor.help.cheatsheet.highlightedText'/></mark>
                          </td>
                          <td>
                            <pre>==<Trans i18nKey='editor.help.cheatsheet.highlightedText'/>==</pre>
                          </td>
                        </tr>
                        <tr>
                          <td><a href='https://example.com'><Trans i18nKey='editor.editorToolbar.link'/></a></td>
                          <td>
                            <pre>[link text](https://example.com)</pre>
                          </td>
                        </tr>
                        <tr>
                          <td><Trans i18nKey='editor.editorToolbar.image'/></td>
                          <td>
                            <pre>![image alt](https:// "title")</pre>
                          </td>
                        </tr>
                        <tr>
                          <td><code><Trans i18nKey='editor.editorToolbar.code'/></code></td>
                          <td>
                            <pre>`<Trans i18nKey='editor.editorToolbar.code'/>`</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <pre style={{ border: 'none !important' }}>
                              <code className="javascript hljs">
                                <div className="wrapper">
                                  <div className="gutter linenumber">
                                    <span data-linenumber="1"/>
                                  </div>
                                  <div className="code">
                                    <span className="hljs-keyword">var</span> x = <span className="hljs-number">5</span>;
                                  </div>
                                </div>
                              </code>
                            </pre>
                          </td>
                          <td>
                            <pre>```javascript<br/>var x = 5;<br/>```</pre>
                          </td>
                        </tr>
                        <tr>
                          <td><img alt=":smile:" className="emoji" src="./build/emojify.js/dist/images/basic/smile.png"
                            title=":smile:"/></td>
                          <td>
                            <pre>:smile:</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>Extern</td>
                          <td>
                            <pre>{'{'}%youtube youtube_id %{'}'}</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>L<sup>a</sup>T<sub>e</sub>X</td>
                          <td>
                            <pre>$L^aT_eX$</pre>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="alert alert-info">
                              <p>
                                <Trans i18nKey='editor.help.cheatsheet.exampleAlert'/>
                              </p>
                            </div>
                          </td>
                          <td>
                            <pre>:::info<br/><Trans i18nKey='editor.help.cheatsheet.exampleAlert'/><br/>:::</pre>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}
