import React from "react";
import * as helpers from "../utils/helpers";

export default function RangeInput({
  thumbNails,
  rEnd,
  rStart,
  handleUpdaterStart,
  handleUpdaterEnd,
  loading,
  control,
  videoMeta,
}) {
  let RANGE_MAX = 100;

  if (thumbNails.length === 0 && !loading) {
    return null;
  }

  if (loading) {
    return (
      <center>
        <h2> processing thumbnails.....</h2>
      </center>
    );
  }

  const durationInSeconds = ((rEnd - rStart) / RANGE_MAX) * videoMeta.duration;
  const diffSec = helpers.toTimeString(durationInSeconds,false)

  const positionStyle = {
    left: `${rStart + (rEnd - rStart) / 2}%`,
  };

  return (
    <>
      <div className="range_pack">
        <div className="image_box">
          {thumbNails.map((imgURL, id) => (
            <img src={imgURL} alt={`sample_video_thumbnail_${id}`} key={id} />
          ))}

          <div
            className="clip_box"
            style={{
              width: `calc(${rEnd - rStart}% )`,
              left: `${rStart}%`,
            }}
            data-start={helpers.toTimeString(
              (rStart / RANGE_MAX) * videoMeta.duration,
              false
            )}
            data-end={helpers.toTimeString(
              (rEnd / RANGE_MAX) * videoMeta.duration,
              false
            )}
          >
            <span className="clip_box_des"></span>
            <span className="clip_box_des"></span>
            <div className="absolute left-[50%] top-[-3.5rem] translate-x-[-50%] translate-y-0">
          <div className="text-white px-3 py-2 bg-black rounded-lg">{diffSec}</div>
        </div>
          </div>

          <input
            className="range"
            type="range"
            min={0}
            max={RANGE_MAX}
            onInput={handleUpdaterStart}
            value={rStart}
          />
          <input
            className="range"
            type="range"
            min={0}
            max={RANGE_MAX}
            onInput={handleUpdaterEnd}
            value={rEnd}
          />
        </div>
      </div>

      {control}
    </>
  );
}
