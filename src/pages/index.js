import Head from "next/head";
import Layout from "@components/Layout";
import Section from "@components/Section";
import Container from "@components/Container";
import Map from "@components/Map";
import Button from "@components/Button";
import fetchCSV from "@components/Data/fetchCSV";
import styles from "@styles/Home.module.scss";
import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRH9vZTB1DKIgi5wdNCyra534Sd-1ZnFZke6TnCsr_btMV4u9xTDtPI1S6sJHp0BNjocbS_4Md_Xz3/pub?output=csv";

export default function Home() {
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [defaultCenter, setDefaultCenter] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxIndex, setMaxIndex] = useState(0);

  useEffect(() => {
    async function loadPath() {
      try {
        const data = await fetchCSV(CSV_URL);
        const coordinates = data.map((row) => ({
          lat: parseFloat(row.latitude),
          lng: parseFloat(row.longitude),
          eventDate: row.eventDate,
          eventGeneratedTime: row.eventGeneratedTime,
        }));
        setPathCoordinates(coordinates);
        if (coordinates.length > 0) {
          setDefaultCenter([coordinates[0].lat, coordinates[0].lng]);
          setMaxIndex(coordinates.length - 1);
        }
      } catch (error) {
        console.error("Error fetching and parsing CSV:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPath();
  }, []);

  useEffect(() => {
    if (isPlaying && pathCoordinates.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < pathCoordinates.length - 1) {
            return prevIndex + 1;
          } else {
            setIsPlaying(false);
            return prevIndex;
          }
        });
      }, 50 / animationSpeed);

      return () => clearInterval(interval);
    }
  }, [isPlaying, pathCoordinates, animationSpeed]);

  const togglePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const changeSpeed = (speed) => {
    setAnimationSpeed(speed);
  };

  const handleSeek = (event) => {
    const newIndex = parseInt(event.target.value);
    setCurrentIndex(newIndex);
  };

  const formatDateTime = (unixTimestamp) => {
    const timestampInSeconds = unixTimestamp / 1000;
    const date = new Date(timestampInSeconds * 1000);
    const formattedDate = date.toLocaleDateString(); // Format date
    const formattedTime = date.toLocaleTimeString(); // Format time
    return { date: formattedDate, time: formattedTime };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Head>
        <title>Path Tracer</title>
        <meta
          name="description"
          content="Help trace the path through given coordinates."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>Visual Representation of the path</h1>

          {/* Only render the map if pathCoordinates are loaded */}
          {pathCoordinates.length > 0 && (
            <>
              {/* Map */}
              <div style={{ marginBottom: "20px" }}>
                <Map
                  className={styles.homeMap}
                  width="1200"
                  height="600"
                  center={defaultCenter}
                  zoom={12}
                >
                  {({ TileLayer, Marker, Popup, Polyline }) => (
                    <>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {/* Marker for starting point */}
                      <Marker
                        position={[
                          pathCoordinates[0].lat,
                          pathCoordinates[0].lng,
                        ]}
                      >
                        <Popup>Starting point</Popup>
                      </Marker>
                      {/* Marker for ending point */}
                      <Marker
                        position={[
                          pathCoordinates[pathCoordinates.length - 1].lat,
                          pathCoordinates[pathCoordinates.length - 1].lng,
                        ]}
                      >
                        <Popup>Ending point</Popup>
                      </Marker>
                      {/* Marker moving along the polyline */}
                      {currentIndex > 0 && (
                        <Marker
                          position={[
                            pathCoordinates[currentIndex].lat,
                            pathCoordinates[currentIndex].lng,
                          ]}
                        >
                          <Popup>
                            <div>
                              <p>
                                Date:{" "}
                                {
                                  formatDateTime(
                                    pathCoordinates[currentIndex].eventDate
                                  ).date
                                }
                              </p>
                              <p>
                                Time:{" "}
                                {
                                  formatDateTime(
                                    pathCoordinates[currentIndex]
                                      .eventGeneratedTime
                                  ).time
                                }
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      <Polyline
                        positions={pathCoordinates
                          .slice(0, currentIndex + 1)
                          .map((coord) => [coord.lat, coord.lng])}
                        color="red"
                      />
                    </>
                  )}
                </Map>
              </div>

              {/* Seek bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="range"
                  min="0"
                  max={maxIndex}
                  value={currentIndex}
                  onChange={handleSeek}
                  className={styles.seekBar}
                  style={{
                    width: "60%",
                  }}
                />
              </div>
              {/* Control buttons */}
              <div
                className={styles.controls}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Button onClick={() => changeSpeed(0.25)}>0.25x</Button>
                <Button onClick={() => changeSpeed(0.5)}>0.5x</Button>
                <Button onClick={() => changeSpeed(0.75)}>0.75x</Button>
                <Button
                  onClick={togglePlayPause}
                  style={{
                    background: isPlaying ? "green" : "red",
                    color: "white",
                  }}
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={() => changeSpeed(1.5)}>1.5x</Button>
                <Button onClick={() => changeSpeed(1.75)}>1.75x</Button>
                <Button onClick={() => changeSpeed(2)}>2x</Button>
              </div>
            </>
          )}
        </Container>
      </Section>
    </Layout>
  );
}
