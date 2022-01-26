let KV = SCRIPT_KIT_KV

let s = async (k, v) => {
  await KV.put(k, JSON.stringify(v))
}

let g = async k => {
  return JSON.parse(await KV.get(k))
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.headers.get('TOKEN') != SCRIPT_KIT_KV_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (request.method === 'POST') {
    try {
      let value = await request.json()
      let k = value?.email || 'anonymous'
      let posts = (await g(k)) || []

      await s(k, [...posts, value])
      return new Response(value, { status: 200 })
    } catch (error) {
      return new Response(error, { status: 500 })
    }
  } else if (request.method === 'GET') {
    try {
      let list = await KV.list()
      // console.log(list.keys.map(k => k.name))

      let values = {}
      // for await (let { name } of list.keys) {
      //   console.log(`Deleting ${name}`)
      //   let deleted = await KV.delete(name)
      //   console.log(JSON.stringify(deleted))
      // }

      for await (let { name } of list.keys) {
        let posts = await g(name)
        values[name] = posts
      }

      return new Response(JSON.stringify(values, null, 2), {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      })
    } catch (error) {
      return new Response(JSON.stringify(error, null, 2), {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      })
    }
  }
}
