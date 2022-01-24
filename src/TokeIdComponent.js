import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { createClient } from 'urql';
import { saveAs } from "file-saver";

import { Card, Col, Image, Row, Typography, Button, Divider, Affix } from 'antd';
const { Title, Text, Paragraph } = Typography;
const APIURL = "https://api.thegraph.com/subgraphs/name/jyotiprakash-m/zora-media";
const TokeIdComponent = () => {
    const [loading, setLoading] = useState(true);

    const [zoraData, setZoraData] = useState([]);

    const downloadFile = (link, fileName) => {
        saveAs(
            link, `${fileName}.mp3`
        )
    }

    const { tokenId } = useParams()
    useEffect(() => {
        const tokensQuery = `
        query {
          tokens(
            where:{tokenID:${tokenId}}
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
            let meta;
            let result;
            try {
                setLoading(true)
                const metaData = await fetch(data.data.tokens[0].metadataURI)
                let response = await metaData.json()
                meta = response
            } catch (err) {
            }
            // console.log("Meta Data: ", meta);
            result = data.data.tokens[0]
            result.image = meta.body?.artwork?.info.uri;
            if (result.image === undefined) {
                result.type = 'video'
            }
            else if (meta && meta.body && meta.body.mimeType && meta.body.mimeType.includes('wav')) {
                result.type = 'audio'
            }
            else {
                result.type = 'image'
            }
            result.info = meta.body;
            if (result.type === 'video') {
                result.image = meta.image;
                result.title = meta.name;
                result.note = meta.description
                result.video = meta.animation_url
            }
            setZoraData(result)
            setLoading(false)
        }
        fetchData();

    }, [])
    // console.log(zoraData);


    return <Row>
        <Col span={24} className="p-2">
            <Row>
                <Col xs={24} sm={24} md={12} lg={12} className="p-1">
                    <Card loading={loading} >
                        {
                            <Image src={zoraData && zoraData.image} preview={false} />
                        }
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} className="p-1">
                    <Card loading={loading} >
                        {zoraData.type === "audio" ? <Title style={{ color: "#4c51bf" }} level={3}>{zoraData.info?.title}</Title> : <Title style={{ color: "#4c51bf" }} level={3}>{zoraData.title}</Title>}
                        <Divider />
                        {
                            (zoraData.type === "audio" && loading === false) &&
                            <Affix offsetTop={10}>
                                <audio controls className='w-full'>
                                    <source src={zoraData.contentURI} type="audio/ogg" />
                                    <source src={zoraData.contentURI} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </Affix>

                        }
                        <Row>
                            <Col span={24}>
                                <Button className='m-2 float-right' type='primary' onClick={() => downloadFile(zoraData.contentURI, zoraData.info?.title)}> Download </Button>

                            </Col>
                        </Row>


                        {
                            loading === false && zoraData.info && <Row>
                                <Col span={24} >
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Artist: </Text></Col>
                                        <Col className='ml-1'><Text>{zoraData.info.artist}</Text></Col>
                                    </Row>
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Duration: </Text></Col>
                                        <Col className='ml-1'><Text>{zoraData.info.duration} second</Text></Col>
                                    </Row>
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Mime Type: </Text></Col>
                                        <Col className='ml-1'><Text>{zoraData.info.mimeType}</Text></Col>
                                    </Row>
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Project Title: </Text></Col>
                                        <Col className='ml-1'><Text>{zoraData.info?.project?.title}</Text></Col>
                                    </Row>
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Description: </Text></Col>
                                        <Col className='ml-1'><Paragraph>{zoraData.info.notes}</Paragraph></Col>
                                    </Row>
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Track Number: </Text></Col>
                                        <Col className='ml-1'><Text>{zoraData.info.trackNumber}</Text></Col>
                                    </Row>
                                    <Row gutter={[8, 16]} className="mt-1">
                                        <Col><Text strong>Version: </Text></Col>
                                        <Col className='ml-1'><Text>{zoraData.info.version}</Text></Col>
                                    </Row>


                                </Col>
                            </Row>
                        }
                        {
                            loading === false && zoraData.type === "video" &&
                            <Row gutter={[8, 16]} className="mt-1">
                                <Col><Text strong>Description: </Text></Col>
                                <Col className='ml-1'><Paragraph>{zoraData.note}</Paragraph></Col>
                            </Row>
                        }
                        {(loading === false && zoraData.type === "video") &&
                            <Row>
                                <Col><Text strong>Video: </Text></Col>
                                <Col span={24} className="h-80">
                                    <iframe
                                        title='Video Source'
                                        className='w-full h-full'
                                        src={zoraData.video}>
                                    </iframe>
                                </Col>
                            </Row>
                        }
                    </Card>
                </Col>
            </Row>

        </Col>

    </Row>
};

export default TokeIdComponent;
