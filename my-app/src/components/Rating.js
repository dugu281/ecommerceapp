
// Rating component
function Rating(props) {
  const { rating, numReviews, caption } = props;
  return (
    <div className="rating product-name">
      <span>
        <i
          className={
            rating >= 1
              ? 'fa-solid fa-star'
              : rating >= 0.5
                ? 'fa-solid fa-star-half-stroke'
                : 'fa-regular fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 2
              ? 'fa-solid fa-star'
              : rating >= 1.5
                ? 'fa-solid fa-star-half-stroke'
                : 'fa-regular fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 3
              ? 'fa-solid fa-star'
              : rating >= 2.5
                ? 'fa-solid fa-star-half-stroke'
                : 'fa-regular fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 4
              ? 'fa-solid fa-star'
              : rating >= 3.5
                ? 'fa-solid fa-star-half-stroke'
                : 'fa-regular fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 5
              ? 'fa-solid fa-star'
              : rating >= 4.5
                ? 'fa-solid fa-star-half-stroke'
                : 'fa-regular fa-star'
          }
        />
      </span>
      {caption ? (
        <span>{caption}</span>
      ) : (
        <span><br />{' ' + numReviews + ' reviews'}</span>
      )
      }
    </div>
  );
}
export default Rating;
