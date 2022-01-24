import { useState, useEffect } from 'react'
import { createClient } from 'urql';
import { Button, Card, Col, Image, Row, Typography, Slider, Affix } from "antd"
const { Title } = Typography;
const APIURL = "https://api.thegraph.com/subgraphs/name/jyotiprakash-m/zora-media";
function App() {
  const [zoraData, setZoraData] = useState([]);
  const [playing, setPlaying] = useState(null)
  const [pause, setPause] = useState(null)
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(6)

  function onAfterChange(value) {
    setRange(value)
    // window.scrollTo(0, 0)
  }
  // console.log(range);

  useEffect(() => {
    const tokensQuery = `
    query {
      tokens(
        orderDirection: desc
        orderBy: createdAtTimestamp
        first: ${range}
      ) {
        id
        tokenID
        contentURI
        metadataURI
      }
    }
    
  `
    const client = createClient({
      url: APIURL
    });

    async function fetchData() {
      let data = await client.query(tokensQuery).toPromise();

      const result = data.data.tokens.filter(token => token.contentURI.includes("https://"));


      setZoraData(result)
      setLoading(true)

      let tokenData = await Promise.all(result.map(async token => {
        let meta;
        try {
          const metaData = await fetch(token.metadataURI)
          let response = await metaData.json()
          meta = response
        } catch (err) {
        }
        // console.log("Meta data: ", meta);
        if (!meta) return
        token.image = meta.body?.artwork?.info.uri;

        if (token.image === undefined) {
          token.type = 'video'
        }
        else if (meta && meta.body && meta.body.mimeType && meta.body.mimeType.includes('wav')) {
          token.type = 'audio'
        }
        else {
          token.type = 'image'
        }
        token.info = meta.body;
        // token.meta = meta
        if (token.type === 'video') {
          token.image = meta.image;
          token.title = meta.name;
        }
        return token
      }))
      setZoraData(tokenData)
      setLoading(false)
    }
    fetchData();

  }, [range])

  // console.log("Fetched Data: ", zoraData);

  return (
    <Row >

      <Col span={24} className="p-4">
        <Affix offsetTop={0}>
          <Card bordered={false} hoverable>
            <Title level={4} >Ranging</Title>
            <Slider
              // tooltipVisible
              // tooltipPlacement="top"
              // tipFormatter
              defaultValue={range}
              max="100"
              onAfterChange={onAfterChange}
              marks={{
                0: '0',
                100: {
                  style: {
                    color: '#f50',
                  },
                  label: <strong>100</strong>,
                },
              }}
            />
          </Card>
        </Affix>
      </Col>
      <Col span={24}>

        <Row>
          {
            zoraData.length > 0 && zoraData.map(token =>
              <Col className='p-2' key={token.id} xs={24} sm={12} md={8} lg={6}>
                <Card loading={loading} hoverable>
                  {token.image && <Image preview={false} src={token.image} />
                  }

                  {token.type === "audio" ? <Title level={5}>{token.info?.title}</Title> : <Title level={5}>{token.title}</Title>}
                  {
                    (playing && playing === token.id && token.type === "audio") ? <audio controls autoPlay className='w-full'>
                      <source src={token.contentURI} type="audio/ogg" />
                      <source src={token.contentURI} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                      :
                      <Button className='mt-1' onClick={() => { setPlaying(token.id); setPause(token.id); }} type='primary'>{
                        token.type === "video" ? <a rel="noreferrer" href={token.contentURI} target="_blank">Open Video</a> : "Play"

                      }</Button>

                  }
                  {
                    (pause && pause === token.id && token.type === "audio") &&
                    <Button className='mt-1' onClick={() => { setPause(null); setPlaying(null) }} type='primary'>Pause</Button>
                  }
                  <Button className='mt-1' href={`/${token.id}`} type="link">Open</Button>
                </Card>
              </Col>
            )
          }
        </Row>

      </Col>

    </Row>
  )
}

export default App
