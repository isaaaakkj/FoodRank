import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { municipalityKey } from '../supabase/functions/_shared/municipality.js'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const profile = mkdtempSync(join(tmpdir(), 'foodrank-browser-'))
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { windowsHide: true, stdio: 'ignore' })
const browser = spawn(process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9223', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
let socket
try {
  let targets
  for (let i = 0; i < 100; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9223/json', { signal: AbortSignal.timeout(1000) })).json(); if (targets.length) break } catch { /* starting */ }
    await delay(100)
  }
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl)
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
  let seq = 0
  const waiting = new Map()
  const exceptions = []
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const promise = waiting.get(message.id)
      if (message.error) promise.reject(new Error(message.error.message))
      else promise.resolve(message.result)
      waiting.delete(message.id)
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
    if (message.method === 'Fetch.requestPaused') {
      void send('Fetch.fulfillRequest', { requestId: message.params.requestId, responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: '*' },
          { name: 'Access-Control-Allow-Headers', value: 'apikey,authorization,x-client-info,content-type' },
          { name: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' }],
        body: 'W10=' }).catch(() => exceptions.push('Review request mock failed'))
    }
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; waiting.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })) })
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }
  const until = async expression => {
    for (let i = 0; i < 100; i++) { if (await evaluate(`Boolean(${expression})`)) return; await delay(100) }
    throw new Error(`Timed out: ${expression}`)
  }
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Fetch.enable', { patterns: [{ urlPattern: 'https://*.supabase.co/rest/v1/reviews*', requestStage: 'Request' }] })
  await send('Page.navigate', { url: 'http://127.0.0.1:4173/FoodRank/' })
  await until('document.querySelector("#state")')
  assert(await evaluate('document.body.innerText.includes("Selecione um estado")'))
  await evaluate('document.querySelector(".skip-link").click()')
  assert.equal(await evaluate('document.activeElement.id'), 'main-content')
  assert.equal(await evaluate('location.hash'), '')
  assert.equal(await evaluate('document.querySelectorAll("#results article").length'), 0)
  await evaluate(`localStorage.setItem(${JSON.stringify(municipalityKey('Cidade Teste', 'Acre'))}, JSON.stringify({timestamp:Date.now(),duration:21600000,data:[{id:'test-1',name:'<img src=x onerror="window.injected=true">',city:'Cidade Teste',state:'Acre',municipalityVerification:'boundary',category:'Italiana',location:'Centro',latitude:0,longitude:0,image:'javascript:alert(1)',rating:4,price:'$$'}]}))`)
  const setCity = city => evaluate(`(() => { const input=document.querySelector('#city'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(city)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await evaluate(`document.querySelector('#state').value='Acre';document.querySelector('#state').dispatchEvent(new Event('change',{bubbles:true}))`)
  await setCity('Cidade Teste')
  await evaluate(`document.querySelector('#city').form.requestSubmit()`)
  await until('document.querySelector("#results article")')
  assert.equal(await evaluate('window.injected'), undefined)
  await evaluate(`document.querySelector('#results button[aria-pressed]').click()`)
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('foodrank-favorites-v1')).length`), 1)
  await evaluate(`localStorage.setItem(${JSON.stringify(municipalityKey('Vazia', 'Acre'))}, JSON.stringify({timestamp:Date.now(),duration:21600000,data:[]}))`)
  await setCity('Vazia')
  await evaluate(`document.querySelector('#city').focus()`)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await until('document.querySelector("#results").innerText.includes("Nenhum restaurante")')
  await setCity('Outra cidade')
  await until('document.querySelectorAll("#results article").length === 0')
  await evaluate(`location.hash='/favorites'`)
  await until('document.querySelector("article")')
  await send('Page.reload')
  await until('document.querySelector("article")')
  assert(await evaluate('document.body.innerText.includes("Restaurantes salvos")'))
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Ver restaurante')).click()`)
  await until('document.querySelector(".leaflet-popup-content")')
  assert.equal(await evaluate('document.querySelector(".leaflet-popup-content img")'), null)
  assert.equal(await evaluate('window.injected'), undefined)
  assert(await evaluate('document.querySelector(".leaflet-popup-content").textContent.includes("<img")'))
  await send('Page.reload')
  await until('document.querySelector(".leaflet-popup-content")')
  await evaluate(`location.hash='/'`)
  await until('document.querySelector("#review-name")')
  assert(await evaluate(`document.querySelector('#review-name').form.querySelector('button[type="submit"]').disabled`))
  mkdirSync('artifacts', { recursive: true })
  for (const width of [375, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 })
    await delay(100)
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Horizontal overflow at ${width}`)
    const screenshot = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(`artifacts/home-${width}.png`, Buffer.from(screenshot.data, 'base64'))
  }
  await evaluate(`location.hash='/missing'`)
  await until('document.querySelector("main h1")?.textContent.includes("encontrada")')
  assert.deepEqual(exceptions, [])
  console.log('PASS: initial guidance, cached search, keyboard submit, empty results, stale results, local favorites persistence, detail reload, map XSS/zero coordinates, review form disabled without location, 404 route, 375/768/1440 layouts; mocked reviews and no runtime exceptions.')
} finally {
  socket?.close()
  browser.kill()
  server.kill()
}
