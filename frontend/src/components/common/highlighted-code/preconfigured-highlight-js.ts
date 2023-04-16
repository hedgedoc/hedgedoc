/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import hljs from 'highlight.js/lib/core'
import abnf from 'highlight.js/lib/languages/abnf'
import accesslog from 'highlight.js/lib/languages/accesslog'
import actionscript from 'highlight.js/lib/languages/actionscript'
import ada from 'highlight.js/lib/languages/ada'
import angelscript from 'highlight.js/lib/languages/angelscript'
import apache from 'highlight.js/lib/languages/apache'
import applescript from 'highlight.js/lib/languages/applescript'
import arcade from 'highlight.js/lib/languages/arcade'
import arduino from 'highlight.js/lib/languages/arduino'
import armasm from 'highlight.js/lib/languages/armasm'
import asciidoc from 'highlight.js/lib/languages/asciidoc'
import aspectj from 'highlight.js/lib/languages/aspectj'
import autohotkey from 'highlight.js/lib/languages/autohotkey'
import autoit from 'highlight.js/lib/languages/autoit'
import avrasm from 'highlight.js/lib/languages/avrasm'
import awk from 'highlight.js/lib/languages/awk'
import axapta from 'highlight.js/lib/languages/axapta'
import bash from 'highlight.js/lib/languages/bash'
import basic from 'highlight.js/lib/languages/basic'
import bnf from 'highlight.js/lib/languages/bnf'
import brainfuck from 'highlight.js/lib/languages/brainfuck'
import c from 'highlight.js/lib/languages/c'
import cal from 'highlight.js/lib/languages/cal'
import capnproto from 'highlight.js/lib/languages/capnproto'
import ceylon from 'highlight.js/lib/languages/ceylon'
import clean from 'highlight.js/lib/languages/clean'
import clojure from 'highlight.js/lib/languages/clojure'
import clojure_repl from 'highlight.js/lib/languages/clojure-repl'
import cmake from 'highlight.js/lib/languages/cmake'
import coffeescript from 'highlight.js/lib/languages/coffeescript'
import coq from 'highlight.js/lib/languages/coq'
import cos from 'highlight.js/lib/languages/cos'
import cpp from 'highlight.js/lib/languages/cpp'
import crmsh from 'highlight.js/lib/languages/crmsh'
import crystal from 'highlight.js/lib/languages/crystal'
import csharp from 'highlight.js/lib/languages/csharp'
import csp from 'highlight.js/lib/languages/csp'
import css from 'highlight.js/lib/languages/css'
import d from 'highlight.js/lib/languages/d'
import dart from 'highlight.js/lib/languages/dart'
import delphi from 'highlight.js/lib/languages/delphi'
import diff from 'highlight.js/lib/languages/diff'
import django from 'highlight.js/lib/languages/django'
import dns from 'highlight.js/lib/languages/dns'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import dos from 'highlight.js/lib/languages/dos'
import dsconfig from 'highlight.js/lib/languages/dsconfig'
import dts from 'highlight.js/lib/languages/dts'
import dust from 'highlight.js/lib/languages/dust'
import ebnf from 'highlight.js/lib/languages/ebnf'
import elixir from 'highlight.js/lib/languages/elixir'
import elm from 'highlight.js/lib/languages/elm'
import erb from 'highlight.js/lib/languages/erb'
import erlang from 'highlight.js/lib/languages/erlang'
import erlang_repl from 'highlight.js/lib/languages/erlang-repl'
import excel from 'highlight.js/lib/languages/excel'
import fix from 'highlight.js/lib/languages/fix'
import flix from 'highlight.js/lib/languages/flix'
import fortran from 'highlight.js/lib/languages/fortran'
import fsharp from 'highlight.js/lib/languages/fsharp'
import gams from 'highlight.js/lib/languages/gams'
import gauss from 'highlight.js/lib/languages/gauss'
import gcode from 'highlight.js/lib/languages/gcode'
import gherkin from 'highlight.js/lib/languages/gherkin'
import glsl from 'highlight.js/lib/languages/glsl'
import gml from 'highlight.js/lib/languages/gml'
import go from 'highlight.js/lib/languages/go'
import golo from 'highlight.js/lib/languages/golo'
import gradle from 'highlight.js/lib/languages/gradle'
import groovy from 'highlight.js/lib/languages/groovy'
import haml from 'highlight.js/lib/languages/haml'
import handlebars from 'highlight.js/lib/languages/handlebars'
import haskell from 'highlight.js/lib/languages/haskell'
import haxe from 'highlight.js/lib/languages/haxe'
import hsp from 'highlight.js/lib/languages/hsp'
import http from 'highlight.js/lib/languages/http'
import hy from 'highlight.js/lib/languages/hy'
import inform7 from 'highlight.js/lib/languages/inform7'
import ini from 'highlight.js/lib/languages/ini'
import irpf90 from 'highlight.js/lib/languages/irpf90'
import isbl from 'highlight.js/lib/languages/isbl'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import jboss_cli from 'highlight.js/lib/languages/jboss-cli'
import json from 'highlight.js/lib/languages/json'
import julia from 'highlight.js/lib/languages/julia'
import julia_repl from 'highlight.js/lib/languages/julia-repl'
import kotlin from 'highlight.js/lib/languages/kotlin'
import lasso from 'highlight.js/lib/languages/lasso'
import latex from 'highlight.js/lib/languages/latex'
import ldif from 'highlight.js/lib/languages/ldif'
import leaf from 'highlight.js/lib/languages/leaf'
import less from 'highlight.js/lib/languages/less'
import lisp from 'highlight.js/lib/languages/lisp'
import livecodeserver from 'highlight.js/lib/languages/livecodeserver'
import livescript from 'highlight.js/lib/languages/livescript'
import llvm from 'highlight.js/lib/languages/llvm'
import lsl from 'highlight.js/lib/languages/lsl'
import lua from 'highlight.js/lib/languages/lua'
import makefile from 'highlight.js/lib/languages/makefile'
import markdown from 'highlight.js/lib/languages/markdown'
import mathematica from 'highlight.js/lib/languages/mathematica'
import matlab from 'highlight.js/lib/languages/matlab'
import maxima from 'highlight.js/lib/languages/maxima'
import mel from 'highlight.js/lib/languages/mel'
import mercury from 'highlight.js/lib/languages/mercury'
import mipsasm from 'highlight.js/lib/languages/mipsasm'
import mizar from 'highlight.js/lib/languages/mizar'
import mojolicious from 'highlight.js/lib/languages/mojolicious'
import monkey from 'highlight.js/lib/languages/monkey'
import moonscript from 'highlight.js/lib/languages/moonscript'
import n1ql from 'highlight.js/lib/languages/n1ql'
import nestedtext from 'highlight.js/lib/languages/nestedtext'
import nginx from 'highlight.js/lib/languages/nginx'
import nim from 'highlight.js/lib/languages/nim'
import nix from 'highlight.js/lib/languages/nix'
import node_repl from 'highlight.js/lib/languages/node-repl'
import nsis from 'highlight.js/lib/languages/nsis'
import objectivec from 'highlight.js/lib/languages/objectivec'
import ocaml from 'highlight.js/lib/languages/ocaml'
import openscad from 'highlight.js/lib/languages/openscad'
import oxygene from 'highlight.js/lib/languages/oxygene'
import parser3 from 'highlight.js/lib/languages/parser3'
import perl from 'highlight.js/lib/languages/perl'
import pf from 'highlight.js/lib/languages/pf'
import pgsql from 'highlight.js/lib/languages/pgsql'
import php from 'highlight.js/lib/languages/php'
import php_template from 'highlight.js/lib/languages/php-template'
import plaintext from 'highlight.js/lib/languages/plaintext'
import pony from 'highlight.js/lib/languages/pony'
import powershell from 'highlight.js/lib/languages/powershell'
import processing from 'highlight.js/lib/languages/processing'
import profile from 'highlight.js/lib/languages/profile'
import prolog from 'highlight.js/lib/languages/prolog'
import properties from 'highlight.js/lib/languages/properties'
import protobuf from 'highlight.js/lib/languages/protobuf'
import puppet from 'highlight.js/lib/languages/puppet'
import purebasic from 'highlight.js/lib/languages/purebasic'
import python from 'highlight.js/lib/languages/python'
import python_repl from 'highlight.js/lib/languages/python-repl'
import q from 'highlight.js/lib/languages/q'
import qml from 'highlight.js/lib/languages/qml'
import r from 'highlight.js/lib/languages/r'
import reasonml from 'highlight.js/lib/languages/reasonml'
import rib from 'highlight.js/lib/languages/rib'
import roboconf from 'highlight.js/lib/languages/roboconf'
import routeros from 'highlight.js/lib/languages/routeros'
import rsl from 'highlight.js/lib/languages/rsl'
import ruby from 'highlight.js/lib/languages/ruby'
import ruleslanguage from 'highlight.js/lib/languages/ruleslanguage'
import rust from 'highlight.js/lib/languages/rust'
import sas from 'highlight.js/lib/languages/sas'
import scala from 'highlight.js/lib/languages/scala'
import scheme from 'highlight.js/lib/languages/scheme'
import scilab from 'highlight.js/lib/languages/scilab'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import smali from 'highlight.js/lib/languages/smali'
import smalltalk from 'highlight.js/lib/languages/smalltalk'
import sml from 'highlight.js/lib/languages/sml'
import sqf from 'highlight.js/lib/languages/sqf'
import sql from 'highlight.js/lib/languages/sql'
import stan from 'highlight.js/lib/languages/stan'
import stata from 'highlight.js/lib/languages/stata'
import step21 from 'highlight.js/lib/languages/step21'
import stylus from 'highlight.js/lib/languages/stylus'
import subunit from 'highlight.js/lib/languages/subunit'
import swift from 'highlight.js/lib/languages/swift'
import taggerscript from 'highlight.js/lib/languages/taggerscript'
import tap from 'highlight.js/lib/languages/tap'
import tcl from 'highlight.js/lib/languages/tcl'
import thrift from 'highlight.js/lib/languages/thrift'
import tp from 'highlight.js/lib/languages/tp'
import twig from 'highlight.js/lib/languages/twig'
import typescript from 'highlight.js/lib/languages/typescript'
import vala from 'highlight.js/lib/languages/vala'
import vbnet from 'highlight.js/lib/languages/vbnet'
import vbscript from 'highlight.js/lib/languages/vbscript'
import vbscript_html from 'highlight.js/lib/languages/vbscript-html'
import verilog from 'highlight.js/lib/languages/verilog'
import vhdl from 'highlight.js/lib/languages/vhdl'
import vim from 'highlight.js/lib/languages/vim'
import wasm from 'highlight.js/lib/languages/wasm'
import x86asm from 'highlight.js/lib/languages/x86asm'
import xl from 'highlight.js/lib/languages/xl'
import xml from 'highlight.js/lib/languages/xml'
import xquery from 'highlight.js/lib/languages/xquery'
import yaml from 'highlight.js/lib/languages/yaml'
import zephir from 'highlight.js/lib/languages/zephir'

hljs.registerLanguage('abnf', abnf)
hljs.registerLanguage('accesslog', accesslog)
hljs.registerLanguage('actionscript', actionscript)
hljs.registerLanguage('ada', ada)
hljs.registerLanguage('angelscript', angelscript)
hljs.registerLanguage('apache', apache)
hljs.registerLanguage('applescript', applescript)
hljs.registerLanguage('arcade', arcade)
hljs.registerLanguage('arduino', arduino)
hljs.registerLanguage('armasm', armasm)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('asciidoc', asciidoc)
hljs.registerLanguage('aspectj', aspectj)
hljs.registerLanguage('autohotkey', autohotkey)
hljs.registerLanguage('autoit', autoit)
hljs.registerLanguage('avrasm', avrasm)
hljs.registerLanguage('awk', awk)
hljs.registerLanguage('axapta', axapta)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('basic', basic)
hljs.registerLanguage('bnf', bnf)
hljs.registerLanguage('brainfuck', brainfuck)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cal', cal)
hljs.registerLanguage('capnproto', capnproto)
hljs.registerLanguage('ceylon', ceylon)
hljs.registerLanguage('clean', clean)
hljs.registerLanguage('clojure', clojure)
hljs.registerLanguage('clojure-repl', clojure_repl)
hljs.registerLanguage('cmake', cmake)
hljs.registerLanguage('coffeescript', coffeescript)
hljs.registerLanguage('coq', coq)
hljs.registerLanguage('cos', cos)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('crmsh', crmsh)
hljs.registerLanguage('crystal', crystal)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('csp', csp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('d', d)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('dart', dart)
hljs.registerLanguage('delphi', delphi)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('django', django)
hljs.registerLanguage('dns', dns)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('dos', dos)
hljs.registerLanguage('dsconfig', dsconfig)
hljs.registerLanguage('dts', dts)
hljs.registerLanguage('dust', dust)
hljs.registerLanguage('ebnf', ebnf)
hljs.registerLanguage('elixir', elixir)
hljs.registerLanguage('elm', elm)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('erb', erb)
hljs.registerLanguage('erlang-repl', erlang_repl)
hljs.registerLanguage('erlang', erlang)
hljs.registerLanguage('excel', excel)
hljs.registerLanguage('fix', fix)
hljs.registerLanguage('flix', flix)
hljs.registerLanguage('fortran', fortran)
hljs.registerLanguage('fsharp', fsharp)
hljs.registerLanguage('gams', gams)
hljs.registerLanguage('gauss', gauss)
hljs.registerLanguage('gcode', gcode)
hljs.registerLanguage('gherkin', gherkin)
hljs.registerLanguage('glsl', glsl)
hljs.registerLanguage('gml', gml)
hljs.registerLanguage('go', go)
hljs.registerLanguage('golo', golo)
hljs.registerLanguage('gradle', gradle)
hljs.registerLanguage('groovy', groovy)
hljs.registerLanguage('haml', haml)
hljs.registerLanguage('handlebars', handlebars)
hljs.registerLanguage('haskell', haskell)
hljs.registerLanguage('haxe', haxe)
hljs.registerLanguage('hsp', hsp)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('http', http)
hljs.registerLanguage('hy', hy)
hljs.registerLanguage('inform7', inform7)
hljs.registerLanguage('ini', ini)
hljs.registerLanguage('irpf90', irpf90)
hljs.registerLanguage('isbl', isbl)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('jboss-cli', jboss_cli)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('julia', julia)
hljs.registerLanguage('julia-repl', julia_repl)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('lasso', lasso)
hljs.registerLanguage('latex', latex)
hljs.registerLanguage('ldif', ldif)
hljs.registerLanguage('leaf', leaf)
hljs.registerLanguage('less', less)
hljs.registerLanguage('lisp', lisp)
hljs.registerLanguage('livecodeserver', livecodeserver)
hljs.registerLanguage('livescript', livescript)
hljs.registerLanguage('llvm', llvm)
hljs.registerLanguage('lsl', lsl)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('makefile', makefile)
hljs.registerLanguage('mathematica', mathematica)
hljs.registerLanguage('matlab', matlab)
hljs.registerLanguage('maxima', maxima)
hljs.registerLanguage('mel', mel)
hljs.registerLanguage('mercury', mercury)
hljs.registerLanguage('mipsasm', mipsasm)
hljs.registerLanguage('mizar', mizar)
hljs.registerLanguage('perl', perl)
hljs.registerLanguage('mojolicious', mojolicious)
hljs.registerLanguage('monkey', monkey)
hljs.registerLanguage('moonscript', moonscript)
hljs.registerLanguage('nestedtext', nestedtext)
hljs.registerLanguage('n1ql', n1ql)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('nim', nim)
hljs.registerLanguage('nix', nix)
hljs.registerLanguage('node-repl', node_repl)
hljs.registerLanguage('nsis', nsis)
hljs.registerLanguage('objectivec', objectivec)
hljs.registerLanguage('ocaml', ocaml)
hljs.registerLanguage('openscad', openscad)
hljs.registerLanguage('oxygene', oxygene)
hljs.registerLanguage('parser3', parser3)
hljs.registerLanguage('pf', pf)
hljs.registerLanguage('pgsql', pgsql)
hljs.registerLanguage('php', php)
hljs.registerLanguage('php-template', php_template)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('pony', pony)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('processing', processing)
hljs.registerLanguage('profile', profile)
hljs.registerLanguage('prolog', prolog)
hljs.registerLanguage('properties', properties)
hljs.registerLanguage('protobuf', protobuf)
hljs.registerLanguage('puppet', puppet)
hljs.registerLanguage('purebasic', purebasic)
hljs.registerLanguage('python', python)
hljs.registerLanguage('python-repl', python_repl)
hljs.registerLanguage('q', q)
hljs.registerLanguage('qml', qml)
hljs.registerLanguage('r', r)
hljs.registerLanguage('reasonml', reasonml)
hljs.registerLanguage('rib', rib)
hljs.registerLanguage('roboconf', roboconf)
hljs.registerLanguage('routeros', routeros)
hljs.registerLanguage('rsl', rsl)
hljs.registerLanguage('ruleslanguage', ruleslanguage)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('sas', sas)
hljs.registerLanguage('scala', scala)
hljs.registerLanguage('scheme', scheme)
hljs.registerLanguage('scilab', scilab)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('smali', smali)
hljs.registerLanguage('smalltalk', smalltalk)
hljs.registerLanguage('sml', sml)
hljs.registerLanguage('sqf', sqf)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('stan', stan)
hljs.registerLanguage('stata', stata)
hljs.registerLanguage('step21', step21)
hljs.registerLanguage('stylus', stylus)
hljs.registerLanguage('subunit', subunit)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('taggerscript', taggerscript)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('tap', tap)
hljs.registerLanguage('tcl', tcl)
hljs.registerLanguage('thrift', thrift)
hljs.registerLanguage('tp', tp)
hljs.registerLanguage('twig', twig)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('vala', vala)
hljs.registerLanguage('vbnet', vbnet)
hljs.registerLanguage('vbscript', vbscript)
hljs.registerLanguage('vbscript-html', vbscript_html)
hljs.registerLanguage('verilog', verilog)
hljs.registerLanguage('vhdl', vhdl)
hljs.registerLanguage('vim', vim)
hljs.registerLanguage('x86asm', x86asm)
hljs.registerLanguage('xl', xl)
hljs.registerLanguage('xquery', xquery)
hljs.registerLanguage('zephir', zephir)
hljs.registerLanguage('wasmn', wasm)

export default hljs
